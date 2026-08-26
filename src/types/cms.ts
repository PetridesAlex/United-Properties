export type PropertyStatus = 'for_sale' | 'for_rent' | 'sold' | 'rented'

export type ProfileRole =
  | 'super_admin'
  | 'admin'
  | 'property_manager'
  | 'content_editor'

export type InquiryStatus = 'new' | 'contacted' | 'closed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: ProfileRole
  active: boolean
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  storage_path: string | null
  alt_text: string | null
  position: number
  is_featured: boolean
  created_at: string
}

export interface Property {
  id: string
  reference_number: string
  slug: string
  title: string
  short_description: string | null
  description: string | null
  status: PropertyStatus
  property_type: string | null
  price: number | null
  currency: string
  district: string | null
  city: string | null
  area: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  bedrooms: number | null
  bathrooms: number | null
  internal_area: number | null
  covered_area: number | null
  plot_size: number | null
  floor: number | null
  floors_total: number | null
  year_built: number | null
  parking_spaces: number | null
  furnishing: string | null
  condition: string | null
  energy_efficiency: string | null
  features: string[]
  featured: boolean
  published: boolean
  publish_to_bazaraki: boolean
  internal_notes: string | null
  seo_title: string | null
  seo_description: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  published_at: string | null
  archived_at: string | null
  property_images?: PropertyImage[]
}

export type PropertyInsert = {
  title: string
  slug?: string
  short_description?: string | null
  description?: string | null
  status?: PropertyStatus
  property_type?: string | null
  price?: number | null
  currency?: string
  district?: string | null
  city?: string | null
  area?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  internal_area?: number | null
  covered_area?: number | null
  plot_size?: number | null
  floor?: number | null
  floors_total?: number | null
  year_built?: number | null
  parking_spaces?: number | null
  furnishing?: string | null
  condition?: string | null
  energy_efficiency?: string | null
  features?: string[]
  featured?: boolean
  published?: boolean
  publish_to_bazaraki?: boolean
  internal_notes?: string | null
  seo_title?: string | null
  seo_description?: string | null
  created_by?: string | null
  updated_by?: string | null
  published_at?: string | null
  archived_at?: string | null
}

export type PropertyUpdate = Partial<PropertyInsert>

export interface SiteContentRow {
  id: string
  page: string
  section: string
  content_key: string
  content_type: string
  value: string
  updated_at: string
  updated_by: string | null
}

export interface SiteSettings {
  id: number
  company_name: string
  company_logo_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  opening_hours: string | null
  social_instagram: string | null
  social_linkedin: string | null
  social_facebook: string | null
  social_whatsapp: string | null
  social_telegram: string | null
  google_maps_embed_url: string | null
  google_maps_link: string | null
  default_seo_title: string | null
  default_seo_description: string | null
  company_registration: string | null
  updated_at: string
  updated_by: string | null
}

export interface Inquiry {
  id: string
  created_at: string
  updated_at?: string
  full_name: string
  email: string
  phone: string | null
  subject: string | null
  property_interest: string | null
  preferred_contact: string | null
  message: string
  source: string | null
  status: InquiryStatus | string
  property_id: string | null
}

export interface BazarakiValidation {
  ready: boolean
  missingFields: string[]
  errors: string[]
  warnings: string[]
}

/** Shape expected by existing public JSX PropertyCard / listing pages */
export interface PublicPropertyCard {
  id: string
  slug: string
  title: string
  location: string
  price: number
  type: string
  status: 'For Sale' | 'For Rent' | 'Sold' | 'Rented'
  bedrooms: number
  bathrooms: number
  sqm: number
  description: string
  features: string[]
  image: string
  gallery: string[]
  featured: boolean
  category?: string
  yearBuilt?: number
  parking?: number
  plotSize?: number
  address?: string
  referenceId?: string
  seoTitle?: string
  seoDescription?: string
  isSignature?: boolean
}

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  for_sale: 'For Sale',
  for_rent: 'For Rent',
  sold: 'Sold',
  rented: 'Rented',
}

export const ADMIN_ROLES: ProfileRole[] = [
  'super_admin',
  'admin',
  'property_manager',
  'content_editor',
]

export function isActiveStatus(status: PropertyStatus): boolean {
  return status === 'for_sale' || status === 'for_rent'
}
