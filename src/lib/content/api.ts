import {supabase} from '../supabase/client'
import type {SiteContentRow, SiteSettings} from '../../types/cms'
import {CONTENT_PAGES, contentKey, type ContentPageDef} from './schema'

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

export async function savePageContent(
  page: ContentPageDef,
  values: Record<string, string>,
  userId?: string | null,
) {
  if (!supabase) throw new Error('Supabase is not configured')

  const rows = page.sections.flatMap((section) =>
    section.fields.map((field) => ({
      page: page.id,
      section: section.id,
      content_key: field.key,
      content_type: field.type,
      value: values[contentKey(page.id, section.id, field.key)] ?? '',
      updated_by: userId ?? null,
    })),
  )

  const {error} = await supabase
    .from('site_content')
    .upsert(rows, {onConflict: 'page,section,content_key'})

  if (error) throw new Error(error.message)
}

export function listManagedPages() {
  return CONTENT_PAGES
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
