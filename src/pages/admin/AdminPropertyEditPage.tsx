import {ArrowLeft, ExternalLink} from 'lucide-react'
import {useEffect, useMemo, useState, type FormEvent} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import toast from 'react-hot-toast'
import {useAdminAuth} from '../../lib/auth/AdminAuthProvider'
import {
  archiveProperty,
  createProperty,
  duplicateProperty,
  fetchPropertyById,
  setPropertyStatus,
  updateProperty,
} from '../../lib/properties/api'
import {
  deletePropertyImage,
  reorderPropertyImages,
  setFeaturedImage,
  uploadPropertyImage,
} from '../../lib/properties/images'
import {completedFromActive, revertCompleted} from '../../lib/properties/mappers'
import {slugify} from '../../lib/properties/slug'
import {validatePropertyForBazaraki} from '../../lib/integrations/bazaraki/validatePropertyForBazaraki'
import {toCmsLocationFields} from '../../lib/integrations/bazaraki/districts'
import {
  BAZARAKI_MUST_HAVE_LABELS,
  COMMERCIAL_TYPE_LABELS,
  BAZARAKI_HOUSE_TYPE_LABELS,
  MUST_HAVES_WITHOUT_PARKING,
  MUST_HAVES_WITH_PARKING,
  resolveAttrsSchema,
  isPlotsOfLandType,
  getBazarakiPropertyTypes,
  isPropertyTypeValidForStatus,
} from '../../lib/integrations/bazaraki'
import {
  LAND_TYPE_OPTIONS,
  PLOT_TYPE_OPTIONS,
  SHARE_OPTIONS,
} from '../../lib/integrations/bazaraki/landMappings'
import {DEFAULT_BAZARAKI_RUBRICS} from '../../lib/integrations/bazaraki/rubricMappings'
import BazarakiDistrictPicker from '../../components/admin/BazarakiDistrictPicker'
import BazarakiLocationPicker from '../../components/admin/BazarakiLocationPicker'
import AdminToggle from '../../components/admin/AdminToggle'
import AdminFormSection from '../../components/admin/AdminFormSection'
import {supabase} from '../../lib/supabase/client'
import type {Property, PropertyImage, PropertyStatus, SiteSettings} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminPropertyEditPage.css'

const LEGACY_PROPERTY_TYPES = [
  'Apartment',
  'Penthouse',
  'Villa',
  'Townhouse',
  'Holiday Home',
  'Detached House',
  'Semi-detached House',
  'Maisonette',
  'Residential Building',
  'Prefabricated House',
  'Development Unit',
  'Commercial',
  'Land',
] as const

const ENERGY_OPTIONS = ['A', 'B+', 'B', 'C', 'D', 'E', 'F', 'G', 'N/A', 'In Progress']
const CONDITION_OPTIONS = ['Brand new', 'Resale', 'Under construction']
const FURNISHING_OPTIONS = ['Fully Furnished', 'Semi-Furnished', 'Unfurnished', 'Appliances only']

type FormState = {
  title: string
  slug: string
  property_type: string
  status: PropertyStatus
  price: string
  currency: string
  district: string
  city: string
  area: string
  address: string
  bedrooms: string
  bathrooms: string
  internal_area: string
  covered_area: string
  plot_size: string
  floor: string
  floors_total: string
  year_built: string
  parking_spaces: string
  furnishing: string
  condition: string
  energy_efficiency: string
  short_description: string
  description: string
  featuresText: string
  featured: boolean
  published: boolean
  publish_to_bazaraki: boolean
  bazaraki_district_id: number | null
  postal_code: string
  bazaraki_must_haves: number[]
  bazaraki_online_viewing: boolean
  bazaraki_air_conditioning: string
  bazaraki_parking: string
  bazaraki_pets: string
  bazaraki_house_type: string
  bazaraki_commercial_type: string
  registration_block: string
  registration_number: string
  land_type: string
  plot_type: string
  coverage: string
  building_density: string
  planning_zone: string
  parcel_number: string
  share: string
  seo_title: string
  seo_description: string
  internal_notes: string
}

const emptyForm: FormState = {
  title: '',
  slug: '',
  property_type: 'Apartments, flats',
  status: 'for_sale',
  price: '',
  currency: 'EUR',
  district: '',
  city: 'Limassol',
  area: '',
  address: '',
  bedrooms: '',
  bathrooms: '',
  internal_area: '',
  covered_area: '',
  plot_size: '',
  floor: '',
  floors_total: '',
  year_built: '',
  parking_spaces: '',
  furnishing: '',
  condition: '',
  energy_efficiency: '',
  short_description: '',
  description: '',
  featuresText: '',
  featured: false,
  published: false,
  publish_to_bazaraki: false,
  bazaraki_district_id: null,
  postal_code: '',
  bazaraki_must_haves: [],
  bazaraki_online_viewing: false,
  bazaraki_air_conditioning: '',
  bazaraki_parking: '',
  bazaraki_pets: '2',
  bazaraki_house_type: '',
  bazaraki_commercial_type: '',
  registration_block: '',
  registration_number: '',
  land_type: '',
  plot_type: '',
  coverage: '',
  building_density: '',
  planning_zone: '',
  parcel_number: '',
  share: '',
  seo_title: '',
  seo_description: '',
  internal_notes: '',
}

function toForm(property: Property): FormState {
  return {
    title: property.title,
    slug: property.slug,
    property_type: property.property_type || 'Apartments, flats',
    status: property.status,
    price: property.price != null ? String(property.price) : '',
    currency: property.currency || 'EUR',
    district: property.district || '',
    city: property.city || '',
    area: property.area || '',
    address: property.address || '',
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : '',
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : '',
    internal_area: property.internal_area != null ? String(property.internal_area) : '',
    covered_area: property.covered_area != null ? String(property.covered_area) : '',
    plot_size: property.plot_size != null ? String(property.plot_size) : '',
    floor: property.floor != null ? String(property.floor) : '',
    floors_total: property.floors_total != null ? String(property.floors_total) : '',
    year_built: property.year_built != null ? String(property.year_built) : '',
    parking_spaces: property.parking_spaces != null ? String(property.parking_spaces) : '',
    furnishing: property.furnishing || '',
    condition: property.condition || '',
    energy_efficiency: property.energy_efficiency || '',
    short_description: property.short_description || '',
    description: property.description || '',
    featuresText: (property.features || []).join(', '),
    featured: property.featured,
    published: property.published,
    publish_to_bazaraki: property.publish_to_bazaraki,
    bazaraki_district_id: property.bazaraki_district_id ?? null,
    postal_code: property.postal_code || '',
    bazaraki_must_haves: property.bazaraki_must_haves ?? [],
    bazaraki_online_viewing: property.bazaraki_online_viewing ?? false,
    bazaraki_air_conditioning:
      property.bazaraki_air_conditioning != null ? String(property.bazaraki_air_conditioning) : '',
    bazaraki_parking: property.bazaraki_parking != null ? String(property.bazaraki_parking) : '',
    bazaraki_pets: property.bazaraki_pets != null ? String(property.bazaraki_pets) : '2',
    bazaraki_house_type:
      property.bazaraki_house_type != null ? String(property.bazaraki_house_type) : '',
    bazaraki_commercial_type:
      property.bazaraki_commercial_type != null ? String(property.bazaraki_commercial_type) : '',
    registration_block:
      property.registration_block != null ? String(property.registration_block) : '',
    registration_number:
      property.registration_number != null ? String(property.registration_number) : '',
    land_type: property.land_type || '',
    plot_type: property.plot_type || '',
    coverage: property.coverage || '',
    building_density: property.building_density || '',
    planning_zone: property.planning_zone || '',
    parcel_number: property.parcel_number || '',
    share: property.share || '',
    seo_title: property.seo_title || '',
    seo_description: property.seo_description || '',
    internal_notes: property.internal_notes || '',
  }
}

function num(value: string): number | null {
  if (!value.trim()) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toPayload(form: FormState) {
  if (!form.title.trim()) throw new Error('Title is required')
  const price = num(form.price)
  if (price != null && price < 0) throw new Error('Price must be positive')

  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugify(form.title),
    property_type: form.property_type || null,
    status: form.status,
    price,
    currency: form.currency || 'EUR',
    district: form.district.trim() || null,
    city: form.city.trim() || null,
    area: form.area.trim() || null,
    address: form.address.trim() || null,
    bedrooms: num(form.bedrooms),
    bathrooms: num(form.bathrooms),
    internal_area: num(form.internal_area),
    covered_area: num(form.covered_area),
    plot_size: num(form.plot_size),
    floor: num(form.floor),
    floors_total: num(form.floors_total),
    year_built: num(form.year_built),
    parking_spaces: num(form.parking_spaces),
    furnishing: form.furnishing.trim() || null,
    condition: form.condition.trim() || null,
    energy_efficiency: form.energy_efficiency.trim() || null,
    short_description: form.short_description.trim() || null,
    description: form.description.trim() || null,
    features: form.featuresText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    featured: form.featured,
    published: form.published,
    publish_to_bazaraki: form.publish_to_bazaraki,
    bazaraki_district_id: form.bazaraki_district_id,
    postal_code: form.postal_code.trim() || null,
    bazaraki_must_haves: form.bazaraki_must_haves.length ? form.bazaraki_must_haves : null,
    bazaraki_online_viewing: form.bazaraki_online_viewing,
    bazaraki_air_conditioning: num(form.bazaraki_air_conditioning),
    bazaraki_parking: num(form.bazaraki_parking),
    bazaraki_pets: num(form.bazaraki_pets),
    bazaraki_house_type: num(form.bazaraki_house_type),
    bazaraki_commercial_type: num(form.bazaraki_commercial_type),
    registration_block: num(form.registration_block),
    registration_number: num(form.registration_number),
    land_type: form.land_type.trim() || null,
    plot_type: form.plot_type.trim() || null,
    coverage: form.coverage.trim() || null,
    building_density: form.building_density.trim() || null,
    planning_zone: form.planning_zone.trim() || null,
    parcel_number: form.parcel_number.trim() || null,
    share: form.share.trim() || null,
    seo_title: form.seo_title.trim() || null,
    seo_description: form.seo_description.trim() || null,
    internal_notes: form.internal_notes.trim() || null,
  }
}

export default function AdminPropertyEditPage() {
  const {id} = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const {user} = useAdminAuth()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [property, setProperty] = useState<Property | null>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [bazarakiSettings, setBazarakiSettings] = useState<SiteSettings>({
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
  })

  useEffect(() => {
    let cancelled = false
    async function loadSettings() {
      if (!supabase) return
      const {data} = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      if (!cancelled && data) {
        setBazarakiSettings((prev) => ({...prev, ...(data as SiteSettings)}))
      }
    }
    void loadSettings()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    async function load() {
      try {
        const row = await fetchPropertyById(id!)
        if (!row || cancelled) return
        setProperty(row)
        setForm(toForm(row))
        setImages(
          [...(row.property_images ?? [])].sort((a, b) => a.position - b.position),
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load property')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, isNew])

  const bazarakiSchema = useMemo(
    () => resolveAttrsSchema(form.property_type, form.status),
    [form.property_type, form.status],
  )

  const propertyTypeOptions = useMemo(() => {
    const options = [...getBazarakiPropertyTypes(form.status)]
    const current = form.property_type?.trim()
    if (
      current &&
      !options.includes(current) &&
      LEGACY_PROPERTY_TYPES.includes(current as (typeof LEGACY_PROPERTY_TYPES)[number])
    ) {
      options.push(current)
    }
    return options
  }, [form.property_type, form.status])

  const bazaraki = useMemo(
    () =>
      validatePropertyForBazaraki(
        {
          ...toPayloadSafe(form),
          property_images: images,
          archived_at: property?.archived_at ?? null,
          bazaraki_district_id: form.bazaraki_district_id,
          postal_code: form.postal_code || null,
        },
        bazarakiSettings,
      ),
    [form, images, property, bazarakiSettings],
  )

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = {...prev, [key]: value}
      if (key === 'title' && isNew && !prev.slug) {
        next.slug = slugify(String(value))
      }
      if (key === 'status') {
        const status = value as PropertyStatus
        if (!isPropertyTypeValidForStatus(prev.property_type, status)) {
          next.property_type = getBazarakiPropertyTypes(status)[0]
        }
      }
      return next
    })
  }

  async function save(opts: {publish?: boolean; draft?: boolean} = {}) {
    setSaving(true)
    try {
      const payload = toPayload(form)
      if (opts.publish) payload.published = true
      if (opts.draft) payload.published = false

      if (isNew) {
        const created = await createProperty(payload, user?.id)
        toast.success(payload.published ? 'Property published' : 'Property saved as draft')
        navigate(`/admin/properties/${created.id}/edit`, {replace: true})
        return
      }

      const updated = await updateProperty(id!, payload, user?.id)
      setProperty(updated)
      setForm(toForm(updated))
      setImages([...(updated.property_images ?? [])].sort((a, b) => a.position - b.position))
      toast.success(payload.published ? 'Property published' : 'Property saved successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length || isNew || !property) {
      toast.error('Save the property first, then upload images.')
      return
    }
    try {
      for (const file of Array.from(files)) {
        const row = await uploadPropertyImage(property.id, file)
        setImages((prev) => [...prev, row as PropertyImage])
      }
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed')
    }
  }

  async function onLifecycle(next: PropertyStatus) {
    if (!property) return
    setSaving(true)
    try {
      const updated = await setPropertyStatus(property.id, next, user?.id)
      setProperty(updated)
      setForm(toForm(updated))
      toast.success(
        next === 'sold'
          ? 'Property marked as sold'
          : next === 'rented'
            ? 'Property marked as rented'
            : 'Property status updated',
      )
      setConfirmAction(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="admin-empty">Loading property…</p>

  const completeTo = property ? completedFromActive(property.status) : null
  const revertTo = property ? revertCompleted(property.status) : null

  return (
    <div className="admin-page admin-page--editor prop-edit">
      <header className="prop-edit__hero">
        <div className="prop-edit__hero-bar">
          <Link className="prop-edit__back" to="/admin/properties">
            <ArrowLeft size={17} strokeWidth={2} aria-hidden />
            <span>Properties</span>
          </Link>
          {!isNew && property ? (
            <a
              className="prop-edit__preview"
              href={`/properties/${property.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={15} strokeWidth={2} aria-hidden />
              <span>Preview</span>
            </a>
          ) : null}
        </div>

        <div className="prop-edit__head">
          <p className="prop-edit__eyebrow">{isNew ? 'New listing' : 'Property editor'}</p>
          <div className="prop-edit__title-row">
            <h1>{isNew ? 'Add Property' : 'Edit Property'}</h1>
            {property?.reference_number ? (
              <span className="prop-edit__ref">{property.reference_number}</span>
            ) : null}
          </div>
          {isNew ? (
            <p className="prop-edit__hint">Reference is assigned automatically when you save.</p>
          ) : null}
        </div>
      </header>

      <form
        className="admin-form prop-edit__form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          void save()
        }}
      >
        <AdminFormSection
          eyebrow="Listing"
          title="Basic information"
          lede="Core identity, pricing, and listing classification."
        >
          <div className="admin-form__grid">
            <div className="admin-field admin-field--full">
              <label>Property title</label>
              <input value={form.title} onChange={(e) => setField('title', e.target.value)} required />
            </div>
            <div className="admin-field">
              <label>URL slug</label>
              <input value={form.slug} onChange={(e) => setField('slug', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Property type</label>
              <select
                value={form.property_type}
                onChange={(e) => setField('property_type', e.target.value)}
              >
                {propertyTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                    {LEGACY_PROPERTY_TYPES.includes(t as (typeof LEGACY_PROPERTY_TYPES)[number]) &&
                    !getBazarakiPropertyTypes(form.status).includes(t)
                      ? ' (legacy)'
                      : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>For Sale / For Rent</label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value as PropertyStatus)}
              >
                <option value="for_sale">For Sale</option>
                <option value="for_rent">For Rent</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Price</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Currency</label>
              <input value={form.currency} onChange={(e) => setField('currency', e.target.value)} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection eyebrow="Location" title="Location" lede="Where the property is situated on the website and in feeds.">
          <BazarakiLocationPicker
            value={{
              district: form.district,
              city: form.city,
              area: form.area,
              bazarakiDistrictId: form.bazaraki_district_id,
            }}
            onChange={({district, city, area, bazarakiDistrictId, postalCode}) => {
              setField('district', district)
              setField('city', city)
              setField('area', area)
              setField('bazaraki_district_id', bazarakiDistrictId)
              if (postalCode && !form.postal_code.trim()) setField('postal_code', postalCode)
            }}
          />
        </AdminFormSection>

        <AdminFormSection
          eyebrow="Specifications"
          title="Property details"
          lede="Rooms, areas, condition, and land-specific attributes when applicable."
        >
          <div className="admin-form__grid">
            {(
              [
                ['bedrooms', 'Bedrooms'],
                ['bathrooms', 'Bathrooms'],
                ['internal_area', 'Internal area'],
                ['covered_area', 'Covered area'],
                ['plot_size', 'Plot size'],
                ['floor', 'Floor'],
                ['floors_total', 'Floors total'],
                ['year_built', 'Year built'],
                ['parking_spaces', 'Parking'],
              ] as const
            ).map(([key, label]) => (
              <div className="admin-field" key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                />
              </div>
            ))}
            <div className="admin-field">
              <label>Furnishing</label>
              <select value={form.furnishing} onChange={(e) => setField('furnishing', e.target.value)}>
                <option value="">—</option>
                {FURNISHING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>Condition</label>
              <select value={form.condition} onChange={(e) => setField('condition', e.target.value)}>
                <option value="">—</option>
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>Energy efficiency</label>
              <select
                value={form.energy_efficiency}
                onChange={(e) => setField('energy_efficiency', e.target.value)}
              >
                <option value="">—</option>
                {ENERGY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            {form.property_type === 'Houses' ? (
              <div className="admin-field">
                <label>House type (Bazaraki)</label>
                <select
                  value={form.bazaraki_house_type}
                  onChange={(e) => setField('bazaraki_house_type', e.target.value)}
                >
                  <option value="">Select house type</option>
                  {Object.entries(BAZARAKI_HOUSE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {isPlotsOfLandType(form.property_type) ? (
              <>
                <div className="admin-field">
                  <label>Land type</label>
                  <select
                    value={form.land_type}
                    onChange={(e) => setField('land_type', e.target.value)}
                  >
                    <option value="">Select land type</option>
                    {LAND_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Plot type</label>
                  <select
                    value={form.plot_type}
                    onChange={(e) => setField('plot_type', e.target.value)}
                  >
                    <option value="">Select plot type</option>
                    {PLOT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Share</label>
                  <select value={form.share} onChange={(e) => setField('share', e.target.value)}>
                    <option value="">—</option>
                    {SHARE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Coverage</label>
                  <input
                    value={form.coverage}
                    onChange={(e) => setField('coverage', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Building density</label>
                  <input
                    value={form.building_density}
                    onChange={(e) => setField('building_density', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Planning zone</label>
                  <input
                    value={form.planning_zone}
                    onChange={(e) => setField('planning_zone', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Parcel number</label>
                  <input
                    value={form.parcel_number}
                    onChange={(e) => setField('parcel_number', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Registration block</label>
                  <input
                    type="number"
                    value={form.registration_block}
                    onChange={(e) => setField('registration_block', e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label>Registration number</label>
                  <input
                    type="number"
                    value={form.registration_number}
                    onChange={(e) => setField('registration_number', e.target.value)}
                  />
                </div>
              </>
            ) : null}
          </div>
        </AdminFormSection>

        <AdminFormSection eyebrow="Content" title="Description" lede="Short summary for cards and full listing copy.">
          <div className="admin-field">
            <label>Short description</label>
            <textarea
              value={form.short_description}
              onChange={(e) => setField('short_description', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label>Full description</label>
            <textarea
              className="admin-textarea--tall"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>
        </AdminFormSection>

        <AdminFormSection eyebrow="Amenities" title="Features" lede="Comma-separated highlights shown on the property page.">
          <div className="admin-field">
            <label>Comma-separated features</label>
            <textarea
              value={form.featuresText}
              onChange={(e) => setField('featuresText', e.target.value)}
              placeholder="Pool, Sea view, Covered parking"
            />
          </div>
        </AdminFormSection>

        <AdminFormSection eyebrow="Media" title="Images" lede="Upload gallery images. Set a main image and drag order with the arrow controls.">
          <div className="admin-field admin-file-upload">
            <label htmlFor="property-images">Upload images</label>
            <p className="admin-file-upload__hint">
              Tap to choose photos from your gallery or take new ones with your camera.
            </p>
            <input
              id="property-images"
              className="admin-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/*"
              multiple
              onChange={(e) => void onUpload(e.target.files)}
            />
          </div>
          <div className="admin-images">
            {images.map((img, index) => (
              <div className="admin-image-tile" key={img.id}>
                <img src={img.image_url} alt={img.alt_text || ''} />
                <div className="admin-image-tile__actions">
                  <button
                    type="button"
                    onClick={() =>
                      void setFeaturedImage(img.property_id, img.id).then(() => {
                        setImages((prev) =>
                          prev.map((row) => ({...row, is_featured: row.id === img.id})),
                        )
                        toast.success('Featured image updated')
                      })
                    }
                  >
                    {img.is_featured ? 'Main' : 'Set main'}
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...images]
                      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                      setImages(next)
                      void reorderPropertyImages(
                        next.map((row, position) => ({id: row.id, position})),
                      )
                    }}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => {
                      const next = [...images]
                      ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
                      setImages(next)
                      void reorderPropertyImages(
                        next.map((row, position) => ({id: row.id, position})),
                      )
                    }}
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void deletePropertyImage(img.id, img.storage_path).then(() => {
                        setImages((prev) => prev.filter((row) => row.id !== img.id))
                        toast.success('Image removed')
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminFormSection>

        <AdminFormSection
          className="admin-publish-section"
          eyebrow="Distribution"
          title="Publishing"
          lede="Control website visibility and Bazaraki syndication."
        >
          <div className="admin-toggle-group">
            <AdminToggle
              label="Publish on Website"
              description="List this property on unitedproperties.eu"
              checked={form.published}
              onChange={(checked) => setField('published', checked)}
            />
            <AdminToggle
              label="Featured Property"
              description="Highlight on the homepage and featured modules"
              checked={form.featured}
              onChange={(checked) => setField('featured', checked)}
            />
            <AdminToggle
              label="Publish to Bazaraki"
              description="Include in the XML feed when readiness checks pass"
              checked={form.publish_to_bazaraki}
              onChange={(checked) => setField('publish_to_bazaraki', checked)}
            />
          </div>

          {form.publish_to_bazaraki ? (
            <div className="admin-publish-bazaraki">
              <BazarakiDistrictPicker
                value={form.bazaraki_district_id}
                onChange={(districtId, district) => {
                  setField('bazaraki_district_id', districtId)
                  if (district) {
                    const cms = toCmsLocationFields(district)
                    setField('district', cms.district)
                    setField('city', cms.city)
                    setField('area', cms.area)
                  }
                }}
                onPostalCodeSuggest={(code) => {
                  if (!form.postal_code.trim()) setField('postal_code', code)
                }}
              />
              <div className="admin-field">
                <label>Postal code (Bazaraki)</label>
                <input
                  value={form.postal_code}
                  onChange={(e) => setField('postal_code', e.target.value)}
                  placeholder="e.g. 4152"
                />
              </div>
              {bazarakiSchema ? (
                <p className="admin-bazaraki-schema">
                  <span className="admin-bazaraki-schema__label">Schema</span>
                  <strong>{bazaraki.attrsSchema ?? 'Unknown'}</strong>
                  {bazaraki.rubricCategory ? <span>{bazaraki.rubricCategory}</span> : null}
                  {bazaraki.rubricId ? (
                    <span className="admin-bazaraki-schema__rubric">Rubric {bazaraki.rubricId}</span>
                  ) : null}
                </p>
              ) : (
                <p className="admin-login__error">
                  This property type and status cannot be exported to Bazaraki.
                </p>
              )}
              {bazarakiSchema === 'commercial' ? (
                <div className="admin-field">
                  <label>Commercial type (Bazaraki)</label>
                  <select
                    value={form.bazaraki_commercial_type}
                    onChange={(e) => setField('bazaraki_commercial_type', e.target.value)}
                  >
                    <option value="">Select type</option>
                    {Object.entries(COMMERCIAL_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              {bazarakiSchema === 'houses' ? (
                <div className="admin-field">
                  <label>House type (Bazaraki)</label>
                  <select
                    value={form.bazaraki_house_type}
                    onChange={(e) => setField('bazaraki_house_type', e.target.value)}
                  >
                    <option value="">Select house type</option>
                    {Object.entries(BAZARAKI_HOUSE_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              {bazarakiSchema === 'houses' || bazarakiSchema === 'apartment' ? (
                <div className="admin-form__grid">
                  <div className="admin-field">
                    <label>Air conditioning</label>
                    <select
                      value={form.bazaraki_air_conditioning}
                      onChange={(e) => setField('bazaraki_air_conditioning', e.target.value)}
                    >
                      <option value="">Auto from features</option>
                      <option value="1">Full, all rooms</option>
                      <option value="2">Partly</option>
                      <option value="3">No</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Parking</label>
                    <select
                      value={form.bazaraki_parking}
                      onChange={(e) => setField('bazaraki_parking', e.target.value)}
                    >
                      <option value="">Auto from property</option>
                      <option value="1">Covered</option>
                      <option value="2">Uncovered</option>
                      <option value="3">No</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Pets</label>
                    <select
                      value={form.bazaraki_pets}
                      onChange={(e) => setField('bazaraki_pets', e.target.value)}
                    >
                      <option value="1">Allowed</option>
                      <option value="2">Not allowed</option>
                    </select>
                  </div>
                </div>
              ) : null}
              {bazarakiSchema === 'residentialBuildings' ? (
                <div className="admin-form__grid">
                  <div className="admin-field">
                    <label>Registration block</label>
                    <input
                      type="number"
                      value={form.registration_block}
                      onChange={(e) => setField('registration_block', e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Registration number</label>
                    <input
                      type="number"
                      value={form.registration_number}
                      onChange={(e) => setField('registration_number', e.target.value)}
                    />
                  </div>
                </div>
              ) : null}
              {bazarakiSchema &&
              bazarakiSchema !== 'prefabricatedHouses' &&
              bazarakiSchema !== 'other' ? (
                <AdminToggle
                  label="Online viewing available"
                  checked={form.bazaraki_online_viewing}
                  onChange={(checked) => setField('bazaraki_online_viewing', checked)}
                />
              ) : null}
              {bazarakiSchema &&
              bazarakiSchema !== 'prefabricatedHouses' &&
              bazarakiSchema !== 'other' &&
              bazarakiSchema !== 'plotsOfLand' ? (
                <div className="admin-field admin-field--full">
                  <label>Must-haves (Bazaraki)</label>
                  <div className="admin-chip-grid">
                    {(bazarakiSchema === 'commercial' || bazarakiSchema === 'residentialBuildings'
                      ? MUST_HAVES_WITH_PARKING
                      : MUST_HAVES_WITHOUT_PARKING
                    ).map((id) => (
                      <AdminToggle
                        key={id}
                        variant="chip"
                        label={BAZARAKI_MUST_HAVE_LABELS[id]}
                        checked={form.bazaraki_must_haves.includes(id)}
                        onChange={(checked) => {
                          setForm((prev) => ({
                            ...prev,
                            bazaraki_must_haves: checked
                              ? [...prev.bazaraki_must_haves, id]
                              : prev.bazaraki_must_haves.filter((item) => item !== id),
                          }))
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <div
            className={`admin-bazaraki-status${bazaraki.ready ? ' admin-bazaraki-status--ready' : ' admin-bazaraki-status--pending'}`}
          >
            <div className="admin-bazaraki-status__head">
              <span className="admin-bazaraki-status__dot" aria-hidden />
              <strong>{bazaraki.ready ? 'Ready for Bazaraki' : 'Not ready for Bazaraki'}</strong>
            </div>
            {bazaraki.missingFields.length ? (
              <p className="admin-bazaraki-status__missing">
                Missing: {bazaraki.missingFields.join(', ')}
              </p>
            ) : null}
            {bazaraki.errors.map((msg: string) => (
              <p key={msg} className="admin-bazaraki-status__error">
                {msg}
              </p>
            ))}
            {bazaraki.warnings.map((msg: string) => (
              <p key={msg} className="admin-bazaraki-status__warning">
                {msg}
              </p>
            ))}
          </div>
        </AdminFormSection>

        <AdminFormSection eyebrow="Search" title="SEO" lede="Optional overrides for search engines and social previews.">
          <div className="admin-field">
            <label>SEO title</label>
            <input value={form.seo_title} onChange={(e) => setField('seo_title', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>SEO description</label>
            <textarea
              value={form.seo_description}
              onChange={(e) => setField('seo_description', e.target.value)}
            />
          </div>
        </AdminFormSection>

        <AdminFormSection eyebrow="Staff only" title="Internal" lede="Private notes for your team. Never shown publicly.">
          <div className="admin-field">
            <label>Internal notes (never shown publicly)</label>
            <textarea
              value={form.internal_notes}
              onChange={(e) => setField('internal_notes', e.target.value)}
            />
          </div>
        </AdminFormSection>

        <div className="admin-form__toolbar prop-edit__save-toolbar">
          <div className="admin-form__toolbar-inner prop-edit__save-toolbar-inner">
            <div className="prop-edit__save-primary">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                disabled={saving}
                onClick={() => void save({draft: true})}
              >
                Save Draft
              </button>
              <button type="submit" className="admin-btn admin-btn--gold" disabled={saving}>
                Save Changes
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--gold"
                disabled={saving}
                onClick={() => void save({publish: true})}
              >
                Publish
              </button>
            </div>

            {!isNew && property ? (
              <>
                <button
                  type="button"
                  className="prop-edit__save-more-toggle"
                  aria-expanded={showMoreActions}
                  onClick={() => setShowMoreActions((open) => !open)}
                >
                  {showMoreActions ? 'Hide actions' : 'More actions'}
                </button>
                <div
                  className={`prop-edit__save-secondary admin-actions${
                    showMoreActions ? ' is-open' : ''
                  }`}
                >
                  {form.published ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      disabled={saving}
                      onClick={() => void save({draft: true})}
                    >
                      Unpublish
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={saving}
                    onClick={() =>
                      void duplicateProperty(property.id, user?.id).then((copy) => {
                        toast.success('Property duplicated')
                        if (copy) navigate(`/admin/properties/${copy.id}/edit`)
                      })
                    }
                  >
                    Duplicate
                  </button>
                  {completeTo === 'sold' ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--gold"
                      onClick={() => setConfirmAction('sold')}
                    >
                      Mark as Sold
                    </button>
                  ) : null}
                  {completeTo === 'rented' ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--gold"
                      onClick={() => setConfirmAction('rented')}
                    >
                      Mark as Rented
                    </button>
                  ) : null}
                  {revertTo ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      onClick={() => void onLifecycle(revertTo)}
                    >
                      Revert to {revertTo === 'for_sale' ? 'For Sale' : 'For Rent'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    onClick={() => setConfirmAction('archive')}
                  >
                    Archive / Delete
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </form>

      {confirmAction ? (
        <div
          className="prop-edit__overlay"
          role="presentation"
          onClick={() => setConfirmAction(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setConfirmAction(null)
          }}
        >
          <div
            className="admin-card prop-edit__dialog"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
          {confirmAction === 'sold' ? (
            <>
              <h2>Mark this property as Sold?</h2>
              <p>
                This property will be removed from active For Sale listings and from the Bazaraki
                feed if enabled. The property record and history will remain stored.
              </p>
              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--gold"
                  onClick={() => void onLifecycle('sold')}
                >
                  Confirm Sold
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : null}
          {confirmAction === 'rented' ? (
            <>
              <h2>Mark this property as Rented?</h2>
              <p>
                This property will be removed from active For Rent listings and from the Bazaraki
                feed if enabled. The property record and history will remain stored.
              </p>
              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--gold"
                  onClick={() => void onLifecycle('rented')}
                >
                  Confirm Rented
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : null}
          {confirmAction === 'archive' ? (
            <>
              <h2>Archive this property?</h2>
              <p>
                The listing will be unpublished and hidden from the website. Historical records stay
                in the CMS.
              </p>
              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() =>
                    void archiveProperty(property!.id, user?.id).then(() => {
                      toast.success('Property archived')
                      navigate('/admin/properties')
                    })
                  }
                >
                  Archive
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => setConfirmAction(null)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function toPayloadSafe(form: FormState) {
  try {
    return toPayload(form)
  } catch {
    return {
      title: form.title,
      published: form.published,
      publish_to_bazaraki: form.publish_to_bazaraki,
      status: form.status,
      price: num(form.price),
      city: form.city,
      property_type: form.property_type,
      description: form.description,
      short_description: form.short_description,
      bedrooms: num(form.bedrooms),
      bathrooms: num(form.bathrooms),
      internal_area: num(form.internal_area),
      covered_area: num(form.covered_area),
      plot_size: num(form.plot_size),
      year_built: num(form.year_built),
      parking_spaces: num(form.parking_spaces),
      furnishing: form.furnishing || null,
      condition: form.condition || null,
      energy_efficiency: form.energy_efficiency || null,
      features: form.featuresText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      address: form.address,
      bazaraki_district_id: form.bazaraki_district_id,
      postal_code: form.postal_code || null,
      bazaraki_must_haves: form.bazaraki_must_haves,
      bazaraki_online_viewing: form.bazaraki_online_viewing,
      bazaraki_air_conditioning: num(form.bazaraki_air_conditioning),
      bazaraki_parking: num(form.bazaraki_parking),
      bazaraki_pets: num(form.bazaraki_pets),
      bazaraki_house_type: num(form.bazaraki_house_type),
      bazaraki_commercial_type: num(form.bazaraki_commercial_type),
      registration_block: num(form.registration_block),
      registration_number: num(form.registration_number),
      land_type: form.land_type || null,
      plot_type: form.plot_type || null,
      coverage: form.coverage || null,
      building_density: form.building_density || null,
      planning_zone: form.planning_zone || null,
      parcel_number: form.parcel_number || null,
      share: form.share || null,
    }
  }
}
