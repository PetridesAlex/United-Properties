import {supabase} from '../supabase/client'
import type {SiteContentRow, SiteSettings} from '../../types/cms'

export async function fetchSiteContentMap(): Promise<Record<string, string>> {
  if (!supabase) return {}
  const {data, error} = await supabase.from('site_content').select('*')
  if (error) {
    console.warn('[content] fetch failed', error.message)
    return {}
  }
  const map: Record<string, string> = {}
  for (const row of (data ?? []) as SiteContentRow[]) {
    map[`${row.page}.${row.section}.${row.content_key}`] = row.value
  }
  return map
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  if (!supabase) return null
  const {data, error} = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
  if (error) {
    console.warn('[settings] fetch failed', error.message)
    return null
  }
  return data as SiteSettings | null
}
