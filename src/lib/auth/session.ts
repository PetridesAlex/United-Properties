import type {Profile, ProfileRole} from '../../types/cms'
import {ADMIN_ROLES} from '../../types/cms'
import {supabase} from '../supabase/client'

export function isAdminRole(role: ProfileRole | string | null | undefined): boolean {
  return Boolean(role && ADMIN_ROLES.includes(role as ProfileRole))
}

export async function fetchCurrentProfile(): Promise<Profile | null> {
  if (!supabase) return null

  const {
    data: {user},
  } = await supabase.auth.getUser()
  if (!user) return null

  const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.warn('[auth] profile fetch failed', error.message)
    return null
  }

  return data as Profile | null
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase.auth.signInWithPassword({email, password})
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}
