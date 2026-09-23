import type {Profile} from '../../types/cms'
import {ADMIN_ROLES} from '../../types/cms'
import {supabase} from '../supabase/client'

export type StaffProfile = Pick<Profile, 'id' | 'email' | 'full_name' | 'role' | 'active'>

export function staffDisplayName(profile: Pick<StaffProfile, 'full_name' | 'email'>): string {
  return profile.full_name?.trim() || profile.email?.split('@')[0] || 'Team member'
}

export async function fetchStaffProfiles(): Promise<StaffProfile[]> {
  if (!supabase) return []

  const {data, error} = await supabase
    .from('profiles')
    .select('id, email, full_name, role, active')
    .eq('active', true)
    .in('role', [...ADMIN_ROLES])
    .order('full_name', {ascending: true, nullsFirst: false})

  if (error) throw new Error(error.message)
  return (data ?? []) as StaffProfile[]
}
