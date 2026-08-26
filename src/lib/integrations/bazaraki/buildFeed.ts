import {createClient} from '@supabase/supabase-js'
import type {Property, PropertyImage, SiteSettings} from '../../../types/cms'
import {validatePropertyForBazaraki} from './validatePropertyForBazaraki'
import {generateBazarakiXml, generateEmptyBazarakiXml} from './generateBazarakiXml'
import {mapPropertyToListItem} from './mapPropertyToListItem'
import {DEFAULT_BAZARAKI_RUBRICS} from './rubricMappings'

const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  company_name: 'United Properties',
  company_logo_url: null,
  phone: null,
  email: null,
  address: null,
  opening_hours: null,
  social_instagram: null,
  social_linkedin: null,
  social_facebook: null,
  social_whatsapp: null,
  social_telegram: null,
  google_maps_embed_url: null,
  google_maps_link: null,
  default_seo_title: null,
  default_seo_description: null,
  company_registration: null,
  bazaraki_feed_enabled: true,
  bazaraki_rubric_for_sale: null,
  bazaraki_rubric_for_rent: 681,
  bazaraki_rubric_apartments_sale: DEFAULT_BAZARAKI_RUBRICS.apartments_sale,
  bazaraki_rubric_apartments_rent: DEFAULT_BAZARAKI_RUBRICS.apartments_rent,
  bazaraki_rubric_houses_sale: DEFAULT_BAZARAKI_RUBRICS.houses_sale,
  bazaraki_rubric_houses_rent: DEFAULT_BAZARAKI_RUBRICS.houses_rent,
  bazaraki_rubric_residential_buildings_sale: DEFAULT_BAZARAKI_RUBRICS.residential_buildings_sale,
  bazaraki_rubric_prefabricated_houses_sale: DEFAULT_BAZARAKI_RUBRICS.prefabricated_houses_sale,
  bazaraki_rubric_other_sale: DEFAULT_BAZARAKI_RUBRICS.other_sale,
  bazaraki_rubric_other_rent: DEFAULT_BAZARAKI_RUBRICS.other_rent,
  bazaraki_rubric_commercial_sale: DEFAULT_BAZARAKI_RUBRICS.commercial_sale,
  bazaraki_rubric_commercial_rent: DEFAULT_BAZARAKI_RUBRICS.commercial_rent,
  bazaraki_rubric_plots_sale: DEFAULT_BAZARAKI_RUBRICS.plots_sale,
  bazaraki_rubric_plots_rent: DEFAULT_BAZARAKI_RUBRICS.plots_rent,
  bazaraki_phone_hide: false,
  bazaraki_negotiable_price: false,
  bazaraki_exchange: false,
  updated_at: '',
  updated_by: null,
}

function getSupabaseUrl(): string | undefined {
  return process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
}

function getSupabaseAnonKey(): string | undefined {
  return process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
}

export function createFeedSupabaseClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) return null
  return createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}})
}

export async function buildBazarakiFeedXml(): Promise<{
  xml: string
  count: number
  enabled: boolean
}> {
  const supabase = createFeedSupabaseClient()
  if (!supabase) {
    return {xml: generateEmptyBazarakiXml(), count: 0, enabled: false}
  }

  const {data: settingsRow} = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  const settings: SiteSettings = settingsRow
    ? {...DEFAULT_SETTINGS, ...(settingsRow as SiteSettings)}
    : DEFAULT_SETTINGS

  if (!settings.bazaraki_feed_enabled) {
    return {xml: generateEmptyBazarakiXml(), count: 0, enabled: false}
  }

  const {data: properties, error} = await supabase
    .from('properties')
    .select('*, property_images(*)')
    .eq('publish_to_bazaraki', true)
    .eq('published', true)
    .in('status', ['for_sale', 'for_rent'])
    .is('archived_at', null)
    .order('updated_at', {ascending: false})

  if (error || !properties?.length) {
    return {xml: generateEmptyBazarakiXml(), count: 0, enabled: true}
  }

  const items = (properties as (Property & {property_images?: PropertyImage[]})[])
    .filter((p) => validatePropertyForBazaraki(p, settings).ready)
    .map((p) => mapPropertyToListItem(p, settings))
    .filter((item): item is NonNullable<typeof item> => item != null)

  return {
    xml: generateBazarakiXml(items),
    count: items.length,
    enabled: true,
  }
}
