import type {Property, PropertyInsert, PropertyStatus, PropertyUpdate} from '../../types/cms'
import {supabase} from '../supabase/client'
import {slugify} from './slug'
import {withResolvedCoordinates} from './mapCoords'

const PROPERTY_SELECT = `
  *,
  property_images (*)
`

export async function fetchPublishedProperties(): Promise<Property[]> {
  if (!supabase) return []
  const {data, error} = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('published', true)
    .is('archived_at', null)
    .order('updated_at', {ascending: false})

  if (error) {
    console.warn('[properties] public fetch failed', error.message)
    return []
  }
  return (data ?? []) as Property[]
}

export async function fetchPublishedPropertyBySlug(slug: string): Promise<Property | null> {
  if (!supabase) return null
  const {data, error} = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('slug', slug)
    .eq('published', true)
    .is('archived_at', null)
    .maybeSingle()

  if (error) {
    console.warn('[properties] slug fetch failed', error.message)
    return null
  }
  return data as Property | null
}

export type AdminPropertyFilters = {
  tab?: string
  search?: string
  property_type?: string
  city?: string
  district?: string
  minPrice?: number
  maxPrice?: number
  published?: boolean
  featured?: boolean
  bazaraki?: boolean
  page?: number
  pageSize?: number
}

type FilterableQuery = {
  in: (column: string, values: string[]) => FilterableQuery
  eq: (column: string, value: string | boolean) => FilterableQuery
  is: (column: string, value: null) => FilterableQuery
  not: (column: string, operator: string, value: null) => FilterableQuery
}

function applyTabFilter<T extends FilterableQuery>(query: T, tab?: string): T {
  switch (tab) {
    case 'active':
      return query
        .in('status', ['for_sale', 'for_rent'])
        .eq('published', true)
        .is('archived_at', null) as T
    case 'for_sale':
      return query.eq('status', 'for_sale').is('archived_at', null) as T
    case 'for_rent':
      return query.eq('status', 'for_rent').is('archived_at', null) as T
    case 'sold':
      return query.eq('status', 'sold').is('archived_at', null) as T
    case 'rented':
      return query.eq('status', 'rented').is('archived_at', null) as T
    case 'drafts':
      return query.eq('published', false).is('archived_at', null) as T
    case 'featured':
      return query.eq('featured', true).is('archived_at', null) as T
    case 'bazaraki':
      return query.eq('publish_to_bazaraki', true).is('archived_at', null) as T
    case 'archived':
      return query.not('archived_at', 'is', null) as T
    default:
      return query.is('archived_at', null) as T
  }
}

export async function fetchAdminProperties(filters: AdminPropertyFilters = {}) {
  if (!supabase) return {rows: [] as Property[], count: 0}

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 24
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('properties')
    .select(PROPERTY_SELECT, {count: 'exact'})
    .order('updated_at', {ascending: false})
    .range(from, to)

  query = applyTabFilter(query, filters.tab)

  if (filters.search?.trim()) {
    const s = filters.search.trim()
    query = query.or(
      `title.ilike.%${s}%,reference_number.ilike.%${s}%,city.ilike.%${s}%,slug.ilike.%${s}%`,
    )
  }
  if (filters.property_type) query = query.eq('property_type', filters.property_type)
  if (filters.city) query = query.ilike('city', filters.city)
  if (filters.district) query = query.ilike('district', filters.district)
  if (filters.minPrice != null) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice != null) query = query.lte('price', filters.maxPrice)
  if (filters.published != null) query = query.eq('published', filters.published)
  if (filters.featured != null) query = query.eq('featured', filters.featured)
  if (filters.bazaraki != null) query = query.eq('publish_to_bazaraki', filters.bazaraki)

  const {data, error, count} = await query
  if (error) throw new Error(error.message)
  return {rows: (data ?? []) as Property[], count: count ?? 0}
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  if (!supabase) return null
  const {data, error} = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as Property | null
}

export async function countPropertiesByTab(): Promise<Record<string, number>> {
  if (!supabase) {
    return {
      all: 0,
      active: 0,
      for_sale: 0,
      for_rent: 0,
      sold: 0,
      rented: 0,
      drafts: 0,
      featured: 0,
      bazaraki: 0,
    }
  }

  const {data, error} = await supabase
    .from('properties')
    .select('status, published, featured, publish_to_bazaraki, archived_at')

  if (error) throw new Error(error.message)
  const rows = data ?? []
  const live = rows.filter((r) => !r.archived_at)
  return {
    all: live.length,
    active: live.filter(
      (r) => r.published && (r.status === 'for_sale' || r.status === 'for_rent'),
    ).length,
    for_sale: live.filter((r) => r.status === 'for_sale').length,
    for_rent: live.filter((r) => r.status === 'for_rent').length,
    sold: live.filter((r) => r.status === 'sold').length,
    rented: live.filter((r) => r.status === 'rented').length,
    drafts: live.filter((r) => !r.published).length,
    featured: live.filter((r) => r.featured).length,
    bazaraki: live.filter((r) => r.publish_to_bazaraki).length,
  }
}

async function slugTaken(slug: string, excludeId?: string) {
  if (!supabase) return false
  let q = supabase.from('properties').select('id').eq('slug', slug)
  if (excludeId) q = q.neq('id', excludeId)
  const {data} = await q.maybeSingle()
  return Boolean(data)
}

export async function createProperty(
  input: PropertyInsert,
  userId?: string | null,
): Promise<Property> {
  if (!supabase) throw new Error('Supabase is not configured')

  let slug = input.slug?.trim() || slugify(input.title)
  if (await slugTaken(slug)) {
    let n = 2
    while (await slugTaken(`${slugify(input.title)}-${n}`)) n += 1
    slug = `${slugify(input.title)}-${n}`
  }

  const payload = withResolvedCoordinates({
    ...input,
    slug,
    features: input.features ?? [],
    created_by: userId ?? null,
    updated_by: userId ?? null,
    published_at: input.published ? new Date().toISOString() : null,
  })

  const {data, error} = await supabase
    .from('properties')
    .insert(payload)
    .select(PROPERTY_SELECT)
    .single()

  if (error) throw new Error(error.message)
  return data as Property
}

export async function updateProperty(
  id: string,
  input: PropertyUpdate,
  userId?: string | null,
): Promise<Property> {
  if (!supabase) throw new Error('Supabase is not configured')

  const patch: PropertyUpdate = withResolvedCoordinates({
    ...input,
    updated_by: userId ?? null,
  })
  if (patch.slug) {
    const slug = patch.slug.trim()
    if (await slugTaken(slug, id)) throw new Error('Slug is already in use')
    patch.slug = slug
  }
  if (patch.published === true && !patch.published_at) {
    patch.published_at = new Date().toISOString()
  }

  const {data, error} = await supabase
    .from('properties')
    .update(patch)
    .eq('id', id)
    .select(PROPERTY_SELECT)
    .single()

  if (error) throw new Error(error.message)
  return data as Property
}

export async function setPropertyStatus(id: string, status: PropertyStatus, userId?: string | null) {
  const patch: PropertyUpdate = {status}
  if (status === 'sold' || status === 'rented') {
    patch.publish_to_bazaraki = false
  }
  return updateProperty(id, patch, userId)
}

export async function archiveProperty(id: string, userId?: string | null) {
  return updateProperty(
    id,
    {
      archived_at: new Date().toISOString(),
      published: false,
      publish_to_bazaraki: false,
    },
    userId,
  )
}

export async function deleteProperty(id: string) {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data: images} = await supabase
    .from('property_images')
    .select('storage_path')
    .eq('property_id', id)

  const paths = (images ?? [])
    .map((row) => row.storage_path)
    .filter((path): path is string => Boolean(path))

  if (paths.length) {
    await supabase.storage.from('properties').remove(paths)
  }

  const {error} = await supabase.from('properties').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function duplicateProperty(id: string, userId?: string | null) {
  const original = await fetchPropertyById(id)
  if (!original) throw new Error('Property not found')

  const {
    id: _id,
    reference_number: _ref,
    created_at: _c,
    updated_at: _u,
    property_images,
    ...rest
  } = original

  const copy = await createProperty(
    {
      ...rest,
      title: `${original.title} (Copy)`,
      slug: '',
      published: false,
      publish_to_bazaraki: false,
      featured: false,
      published_at: null,
      archived_at: null,
    },
    userId,
  )

  if (property_images?.length && supabase) {
    const rows = property_images.map((img) => ({
      property_id: copy.id,
      image_url: img.image_url,
      storage_path: img.storage_path,
      alt_text: img.alt_text,
      position: img.position,
      is_featured: img.is_featured,
      kind: img.kind || 'gallery',
    }))
    await supabase.from('property_images').insert(rows)
  }

  return fetchPropertyById(copy.id)
}
