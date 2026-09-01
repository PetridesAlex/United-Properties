import type {Client, ClientStatus, Inquiry} from '../../types/cms'
import {supabase} from '../supabase/client'
import {formatClientName} from './types'

export type AdminClientFilters = {
  search?: string
  status?: ClientStatus | 'all'
  limit?: number
}

export async function fetchAdminClients(filters: AdminClientFilters = {}): Promise<Client[]> {
  if (!supabase) return []

  let query = supabase
    .from('clients')
    .select('*')
    .order('last_contact_at', {ascending: false, nullsFirst: false})
    .order('created_at', {ascending: false})

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  const {data, error} = await query
  if (error) throw new Error(error.message)

  let rows = (data ?? []) as Client[]

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    rows = rows.filter((row) => {
      const hay = [
        formatClientName(row),
        row.email ?? '',
        row.phone ?? '',
        row.notes ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }

  const ids = rows.map((r) => r.id)
  if (ids.length === 0) return rows

  const {data: inquiryRows} = await supabase
    .from('inquiries')
    .select('client_id')
    .in('client_id', ids)

  const counts = new Map<string, number>()
  for (const row of inquiryRows ?? []) {
    const id = row.client_id as string | null
    if (!id) continue
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  return rows.map((row) => ({
    ...row,
    enquiry_count: counts.get(row.id) ?? 0,
  }))
}

export async function fetchRecentClients(limit = 5): Promise<Client[]> {
  return fetchAdminClients({status: 'active', limit})
}

export async function fetchClientById(id: string): Promise<Client | null> {
  if (!supabase) return null
  const {data, error} = await supabase.from('clients').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null

  const {count} = await supabase
    .from('inquiries')
    .select('id', {count: 'exact', head: true})
    .eq('client_id', id)

  return {
    ...(data as Client),
    enquiry_count: count ?? 0,
  }
}

export async function fetchClientInquiries(clientId: string): Promise<Inquiry[]> {
  if (!supabase) return []
  const {data, error} = await supabase
    .from('inquiries')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', {ascending: false})

  if (error) throw new Error(error.message)
  return (data ?? []) as Inquiry[]
}

export type ClientWriteInput = {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  notes?: string | null
  source?: string
  status?: string
  last_contact_at?: string | null
  created_by?: string | null
}

function normalizeWrite(input: ClientWriteInput) {
  return {
    first_name: input.first_name.trim() || 'Unknown',
    last_name: (input.last_name ?? '').trim(),
    email: input.email?.trim() ? input.email.trim().toLowerCase() : null,
    phone: input.phone?.trim() || null,
    notes: input.notes?.trim() || null,
    source: input.source ?? 'manual',
    status: input.status ?? 'active',
    last_contact_at: input.last_contact_at ?? null,
  }
}

export async function createClient(input: ClientWriteInput, userId?: string | null): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const payload = {
    ...normalizeWrite(input),
    last_contact_at: input.last_contact_at ?? new Date().toISOString(),
    created_by: userId ?? null,
  }

  const {data, error} = await supabase.from('clients').insert(payload).select('*').single()
  if (error) throw new Error(error.message)
  return data as Client
}

export async function updateClient(id: string, input: ClientWriteInput): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data, error} = await supabase
    .from('clients')
    .update(normalizeWrite(input))
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as Client
}

export async function archiveClient(id: string): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data, error} = await supabase
    .from('clients')
    .update({status: 'archived'})
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as Client
}

export async function restoreClient(id: string): Promise<Client> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {data, error} = await supabase
    .from('clients')
    .update({status: 'active'})
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data as Client
}

export async function deleteClient(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')

  const {error} = await supabase.from('clients').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
