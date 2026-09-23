import type {
  ClientNote,
  ClientPropertyInterestStatus,
  ClientPropertyLink,
} from '../../types/cms'
import {supabase} from '../supabase/client'
import {logClientActivity} from './activity'
import {interestLabel} from './crmLabels'
import {staffDisplayName} from './staff'

function propertyLocation(prop: {area?: unknown; district?: unknown}): string | null {
  const parts = [prop.area, prop.district].filter(
    (v): v is string => typeof v === 'string' && v.trim() !== '',
  )
  return parts.length ? [...new Set(parts)].join(', ') : null
}

async function hydratePropertyLinks(rows: ClientPropertyLink[]): Promise<ClientPropertyLink[]> {
  if (!supabase || rows.length === 0) return rows

  const propertyIds = [...new Set(rows.map((r) => r.property_id))]
  const linkerIds = [...new Set(rows.map((r) => r.linked_by).filter(Boolean))] as string[]

  const [propsRes, imagesRes, profilesRes] = await Promise.all([
    supabase
      .from('properties')
      .select('id, title, slug, area, district, city, price, status, reference_number')
      .in('id', propertyIds),
    supabase
      .from('property_images')
      .select('property_id, image_url, position, is_featured')
      .in('property_id', propertyIds)
      .order('position', {ascending: true}),
    linkerIds.length
      ? supabase.from('profiles').select('id, full_name, email').in('id', linkerIds)
      : Promise.resolve({data: [] as {id: string; full_name: string | null; email: string}[]}),
  ])

  const coverByProperty = new Map<string, string>()
  for (const img of imagesRes.data ?? []) {
    const pid = img.property_id as string
    if (img.is_featured || !coverByProperty.has(pid)) {
      coverByProperty.set(pid, img.image_url as string)
    }
  }

  const propMap = new Map((propsRes.data ?? []).map((p) => [p.id as string, p]))
  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, staffDisplayName(p)]),
  )

  return rows.map((row) => {
    const prop = propMap.get(row.property_id)
    return {
      ...row,
      linked_by_name: row.linked_by ? profileMap.get(row.linked_by) ?? null : null,
      property: prop
        ? {
            id: prop.id as string,
            title: prop.title as string,
            slug: prop.slug as string,
            location: propertyLocation(prop),
            city: (prop.city as string | null) ?? null,
            price: (prop.price as number | null) ?? null,
            status: (prop.status as string | null) ?? null,
            reference_number: (prop.reference_number as string | null) ?? null,
            cover_url: coverByProperty.get(row.property_id) ?? null,
          }
        : null,
    }
  })
}

export async function fetchClientPropertyLinks(clientId: string): Promise<ClientPropertyLink[]> {
  if (!supabase) return []
  const {data, error} = await supabase
    .from('client_properties')
    .select('*')
    .eq('client_id', clientId)
    .order('linked_at', {ascending: false})

  if (error) throw new Error(error.message)
  return hydratePropertyLinks((data ?? []) as ClientPropertyLink[])
}

export async function linkPropertyToClient(input: {
  clientId: string
  propertyId: string
  actorId?: string | null
  interestStatus?: ClientPropertyInterestStatus
  notes?: string | null
}): Promise<ClientPropertyLink> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data, error} = await supabase
    .from('client_properties')
    .insert({
      client_id: input.clientId,
      property_id: input.propertyId,
      interest_status: input.interestStatus ?? 'suggested',
      notes: input.notes?.trim() || null,
      linked_by: input.actorId ?? null,
      updated_by: input.actorId ?? null,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  const [hydrated] = await hydratePropertyLinks([data as ClientPropertyLink])
  const ref = hydrated.property?.reference_number || hydrated.property?.title || 'property'

  await logClientActivity({
    clientId: input.clientId,
    actorId: input.actorId,
    action: 'property_linked',
    propertyId: input.propertyId,
    description: `Linked property ${ref}.`,
    newValue: interestLabel(input.interestStatus ?? 'suggested'),
  })

  return hydrated
}

export async function updateClientPropertyInterest(input: {
  linkId: string
  clientId: string
  propertyId: string
  interestStatus: ClientPropertyInterestStatus
  actorId?: string | null
  previousStatus?: string | null
  notes?: string | null
}): Promise<ClientPropertyLink> {
  if (!supabase) throw new Error('Supabase is not configured')

  const payload: Record<string, unknown> = {
    interest_status: input.interestStatus,
    updated_by: input.actorId ?? null,
  }
  if (input.notes !== undefined) payload.notes = input.notes?.trim() || null

  const {data, error} = await supabase
    .from('client_properties')
    .update(payload)
    .eq('id', input.linkId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  const [hydrated] = await hydratePropertyLinks([data as ClientPropertyLink])
  const ref = hydrated.property?.reference_number || hydrated.property?.title || 'property'

  await logClientActivity({
    clientId: input.clientId,
    actorId: input.actorId,
    action: 'property_status_changed',
    propertyId: input.propertyId,
    description: `Updated interest for ${ref}.`,
    previousValue: interestLabel(input.previousStatus),
    newValue: interestLabel(input.interestStatus),
  })

  return hydrated
}

export async function unlinkPropertyFromClient(input: {
  linkId: string
  clientId: string
  propertyId: string
  actorId?: string | null
  propertyLabel?: string
}): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {error} = await supabase.from('client_properties').delete().eq('id', input.linkId)
  if (error) throw new Error(error.message)

  await logClientActivity({
    clientId: input.clientId,
    actorId: input.actorId,
    action: 'property_unlinked',
    propertyId: input.propertyId,
    description: `Removed property ${input.propertyLabel || input.propertyId.slice(0, 8)}.`,
  })
}

export type LinkablePropertyRow = {
  id: string
  title: string
  reference_number: string | null
  location: string | null
  city: string | null
  price: number | null
  status: string | null
  property_type: string | null
  bedrooms: number | null
  published: boolean
  cover_url: string | null
}

export async function fetchPropertiesForLink(): Promise<LinkablePropertyRow[]> {
  if (!supabase) return []

  const {data, error} = await supabase
    .from('properties')
    .select(
      'id, title, reference_number, area, district, city, price, status, property_type, bedrooms, published',
    )
    .order('updated_at', {ascending: false})
    .limit(1000)

  if (error) throw new Error(error.message)
  const rows = data ?? []
  if (rows.length === 0) return []

  const {data: images} = await supabase
    .from('property_images')
    .select('property_id, image_url, position, is_featured')
    .in(
      'property_id',
      rows.map((r) => r.id as string),
    )
    .order('position', {ascending: true})

  const coverByProperty = new Map<string, string>()
  for (const img of images ?? []) {
    const pid = img.property_id as string
    if (img.is_featured || !coverByProperty.has(pid)) {
      coverByProperty.set(pid, img.image_url as string)
    }
  }

  return rows.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    reference_number: (r.reference_number as string | null) ?? null,
    location: propertyLocation(r),
    city: (r.city as string | null) ?? null,
    price: r.price != null ? Number(r.price) : null,
    status: (r.status as string | null) ?? null,
    property_type: (r.property_type as string | null) ?? null,
    bedrooms: (r.bedrooms as number | null) ?? null,
    published: Boolean(r.published),
    cover_url: coverByProperty.get(r.id as string) ?? null,
  }))
}

export async function fetchClientNotes(clientId: string): Promise<ClientNote[]> {
  if (!supabase) return []
  const {data, error} = await supabase
    .from('client_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', {ascending: false})

  if (error) throw new Error(error.message)
  const rows = (data ?? []) as ClientNote[]
  const authorIds = [...new Set(rows.map((r) => r.created_by).filter(Boolean))] as string[]
  if (!authorIds.length) return rows

  const {data: profiles} = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', authorIds)
  const map = new Map((profiles ?? []).map((p) => [p.id, staffDisplayName(p)]))
  return rows.map((row) => ({
    ...row,
    author_name: row.created_by ? map.get(row.created_by) ?? null : null,
  }))
}

export async function addClientNote(input: {
  clientId: string
  body: string
  actorId?: string | null
}): Promise<ClientNote> {
  if (!supabase) throw new Error('Supabase is not configured')
  const body = input.body.trim()
  if (!body) throw new Error('Note cannot be empty')

  const {data, error} = await supabase
    .from('client_notes')
    .insert({
      client_id: input.clientId,
      body,
      created_by: input.actorId ?? null,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  await logClientActivity({
    clientId: input.clientId,
    actorId: input.actorId,
    action: 'note_added',
    description: 'Added an internal note.',
  })

  return data as ClientNote
}
