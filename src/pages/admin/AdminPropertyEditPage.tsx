import {ArrowLeft, ExternalLink} from 'lucide-react'
import {useEffect, useMemo, useRef, useState, type FormEvent} from 'react'
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
  getDistrictCoordinates,
} from '../../lib/integrations/bazaraki'
import {
  LAND_TYPE_OPTIONS,
  PLOT_TYPE_OPTIONS,
  SHARE_OPTIONS,
} from '../../lib/integrations/bazaraki/landMappings'
import {DEFAULT_BAZARAKI_RUBRICS} from '../../lib/integrations/bazaraki/rubricMappings'
import BazarakiLocationPicker from '../../components/admin/BazarakiLocationPicker'
import PropertyMapPinPicker from '../../components/admin/PropertyMapPinPicker'
import AdminToggle from '../../components/admin/AdminToggle'
import AdminFormSection from '../../components/admin/AdminFormSection'
import {supabase} from '../../lib/supabase/client'
import type {Property, PropertyImage, PropertyStatus, SiteSettings} from '../../types/cms'
import '../../components/admin/AdminShell.css'
import './AdminPropertyEditPage.css'

const LISTING_STEPS = [
  {id: 'category', label: '1. Category', title: 'Choose a category'},
  {id: 'location', label: '2. Location', title: 'Select location'},
  {id: 'map', label: '3. Map', title: 'Location on the map'},
  {id: 'details', label: '4. Details', title: 'Property details'},
  {id: 'media', label: '5. Media', title: 'Images & description'},
  {id: 'publish', label: '6. Publish', title: 'Publishing'},
] as const

type ListingStepId = (typeof LISTING_STEPS)[number]['id']

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
  latitude: string
  longitude: string
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
  latitude: '',
  longitude: '',
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

const PROGRESS_PREFIX = 'up.propertyEditor.v1:'
const NEW_PROGRESS_KEY = 'new'

type EditorProgress = {
  form: FormState
  listingStep: ListingStepId
  slugLocked: boolean
  updatedAt: string
}

function isListingStepId(value: unknown): value is ListingStepId {
  return LISTING_STEPS.some((step) => step.id === value)
}

function readEditorProgress(key: string): EditorProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<EditorProgress>
    if (!parsed?.form || typeof parsed.form !== 'object') return null
    if (!isListingStepId(parsed.listingStep)) return null
    return {
      form: {...emptyForm, ...parsed.form},
      listingStep: parsed.listingStep,
      slugLocked: Boolean(parsed.slugLocked),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

function writeEditorProgress(key: string, progress: Omit<EditorProgress, 'updatedAt'>) {
  try {
    const payload: EditorProgress = {
      ...progress,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(PROGRESS_PREFIX + key, JSON.stringify(payload))
  } catch {
    // Ignore quota / private mode failures — DB autosave still covers titled drafts.
  }
}

function clearEditorProgress(key: string) {
  try {
    localStorage.removeItem(PROGRESS_PREFIX + key)
  } catch {
    // ignore
  }
}

function moveEditorProgress(fromKey: string, toKey: string) {
  const current = readEditorProgress(fromKey)
  if (!current) return
  writeEditorProgress(toKey, {
    form: current.form,
    listingStep: current.listingStep,
    slugLocked: current.slugLocked,
  })
  clearEditorProgress(fromKey)
}

function hasProgressContent(form: FormState, step: ListingStepId) {
  if (step !== 'category') return true
  return Boolean(
    form.title.trim() ||
      form.district.trim() ||
      form.area.trim() ||
      form.price.trim() ||
      form.description.trim() ||
      form.bazaraki_district_id != null,
  )
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
    latitude: property.latitude != null ? String(property.latitude) : '',
    longitude: property.longitude != null ? String(property.longitude) : '',
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
    latitude: num(form.latitude),
    longitude: num(form.longitude),
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
  const [uploadingImages, setUploadingImages] = useState(false)
  const [slugLocked, setSlugLocked] = useState(false)
  const slugLockedRef = useRef(false)
  const [autosaveState, setAutosaveState] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>(
    'idle',
  )
  const [autosaveError, setAutosaveError] = useState('')
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [listingStep, setListingStep] = useState<ListingStepId>('category')
  const [progressReady, setProgressReady] = useState(false)
  const [resumeBanner, setResumeBanner] = useState<{step: ListingStepId; updatedAt: string} | null>(
    null,
  )
  const formRef = useRef(form)
  const listingStepRef = useRef(listingStep)
  const lastSavedJson = useRef('')
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const creatingDraft = useRef(false)
  const autosaveReady = useRef(isNew)

  formRef.current = form
  listingStepRef.current = listingStep
  slugLockedRef.current = slugLocked

  const progressKey = isNew ? NEW_PROGRESS_KEY : id!

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
    setProgressReady(false)
    setResumeBanner(null)

    if (isNew) {
      const saved = readEditorProgress(NEW_PROGRESS_KEY)
      if (saved && hasProgressContent(saved.form, saved.listingStep)) {
        setForm(saved.form)
        setListingStep(saved.listingStep)
        slugLockedRef.current = saved.slugLocked
        setSlugLocked(saved.slugLocked)
        setResumeBanner({step: saved.listingStep, updatedAt: saved.updatedAt})
      } else {
        setForm(emptyForm)
        setListingStep('category')
        slugLockedRef.current = false
        setSlugLocked(false)
      }
      setProperty(null)
      setImages([])
      lastSavedJson.current = JSON.stringify(emptyForm)
      autosaveReady.current = true
      setProgressReady(true)
      return
    }

    let cancelled = false
    setLoading(true)
    async function load() {
      try {
        const row = await fetchPropertyById(id!)
        if (!row || cancelled) return
        const nextForm = toForm(row)
        setProperty(row)
        setImages(
          [...(row.property_images ?? [])].sort((a, b) => a.position - b.position),
        )
        lastSavedJson.current = JSON.stringify(nextForm)

        const saved = readEditorProgress(id!)
        const lockSlug = Boolean(row.published)
        const localNewer =
          Boolean(saved) &&
          !row.published &&
          new Date(saved!.updatedAt).getTime() > new Date(row.updated_at).getTime() &&
          JSON.stringify(saved!.form) !== JSON.stringify(nextForm)

        if (localNewer && saved) {
          setForm(saved.form)
          slugLockedRef.current = saved.slugLocked
          setSlugLocked(saved.slugLocked)
        } else {
          setForm(nextForm)
          slugLockedRef.current = lockSlug
          setSlugLocked(lockSlug)
        }

        if (saved && isListingStepId(saved.listingStep)) {
          setListingStep(saved.listingStep)
          if (!row.published && (saved.listingStep !== 'category' || localNewer)) {
            setResumeBanner({step: saved.listingStep, updatedAt: saved.updatedAt})
          }
        } else {
          setListingStep('category')
        }

        autosaveReady.current = true
        setProgressReady(true)
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

  useEffect(() => {
    if (loading || !progressReady) return
    if (isNew && !hasProgressContent(form, listingStep)) {
      clearEditorProgress(NEW_PROGRESS_KEY)
      return
    }
    writeEditorProgress(progressKey, {form, listingStep, slugLocked})
  }, [form, listingStep, slugLocked, loading, progressReady, isNew, progressKey])

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

  function goToStep(step: ListingStepId) {
    setListingStep(step)
    setResumeBanner(null)
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (key === 'slug') {
      slugLockedRef.current = true
      setSlugLocked(true)
    }
    setForm((prev) => {
      const next = {...prev, [key]: value}
      if (key === 'title' && !slugLockedRef.current) {
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

  function resetSlugFromTitle() {
    slugLockedRef.current = false
    setSlugLocked(false)
    setForm((prev) => ({...prev, slug: slugify(prev.title)}))
  }

  async function persistForm(
    nextForm: FormState,
    opts: {publish?: boolean; draft?: boolean; quiet?: boolean} = {},
  ) {
    const payload = toPayload(nextForm)
    if (opts.publish) payload.published = true
    if (opts.draft) payload.published = false

    if (isNew) {
      const created = await createProperty(
        {...payload, published: opts.publish ? true : false},
        user?.id,
      )
      lastSavedJson.current = JSON.stringify(nextForm)
      moveEditorProgress(NEW_PROGRESS_KEY, String(created.id))
      writeEditorProgress(String(created.id), {
        form: nextForm,
        listingStep: listingStepRef.current,
        slugLocked: slugLockedRef.current,
      })
      if (opts.publish) {
        clearEditorProgress(String(created.id))
      }
      if (!opts.quiet) {
        toast.success(payload.published ? 'Property published' : 'Property saved as draft')
      }
      navigate(`/admin/properties/${created.id}/edit`, {replace: true})
      return created
    }

    const updated = await updateProperty(id!, payload, user?.id)
    lastSavedJson.current = JSON.stringify(toForm(updated))
    setProperty(updated)
    writeEditorProgress(id!, {
      form: toForm(updated),
      listingStep: listingStepRef.current,
      slugLocked: slugLockedRef.current,
    })
    if (opts.publish) {
      clearEditorProgress(id!)
    }
    if (!opts.quiet) {
      setForm(toForm(updated))
      setImages([...(updated.property_images ?? [])].sort((a, b) => a.position - b.position))
      toast.success(payload.published ? 'Property published' : 'Property saved successfully')
    }
    return updated
  }

  function discardUnfinishedProgress() {
    clearEditorProgress(progressKey)
    setResumeBanner(null)
    if (isNew) {
      setForm(emptyForm)
      setListingStep('category')
      slugLockedRef.current = false
      setSlugLocked(false)
      lastSavedJson.current = JSON.stringify(emptyForm)
      setAutosaveState('idle')
      return
    }
    if (!property) return
    const nextForm = toForm(property)
    setForm(nextForm)
    setListingStep('category')
    const lockSlug = Boolean(property.published)
    slugLockedRef.current = lockSlug
    setSlugLocked(lockSlug)
    lastSavedJson.current = JSON.stringify(nextForm)
    setAutosaveState('idle')
  }

  async function save(opts: {publish?: boolean; draft?: boolean} = {}) {
    setSaving(true)
    setAutosaveError('')
    try {
      await persistForm(form, opts)
      setAutosaveState('saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
      setAutosaveState('error')
      setAutosaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function runAutosave() {
    if (!autosaveReady.current || creatingDraft.current || saving) return
    const latest = formRef.current
    if (!latest.title.trim()) return

    const snapshot = JSON.stringify(latest)
    if (snapshot === lastSavedJson.current) {
      setAutosaveState((prev) => (prev === 'pending' ? 'idle' : prev))
      return
    }

    setAutosaveState('saving')
    setAutosaveError('')
    try {
      if (isNew) {
        creatingDraft.current = true
        await persistForm(latest, {draft: true, quiet: true})
        creatingDraft.current = false
        setAutosaveState('saved')
        return
      }
      // Keep current publish flags — only persist field changes.
      await persistForm(latest, {quiet: true})
      setAutosaveState('saved')
    } catch (err) {
      creatingDraft.current = false
      setAutosaveState('error')
      setAutosaveError(err instanceof Error ? err.message : 'Autosave failed')
    }
  }

  useEffect(() => {
    if (loading || !autosaveReady.current) return
    if (!form.title.trim()) return
    if (JSON.stringify(form) === lastSavedJson.current) return

    setAutosaveState('pending')
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      void runAutosave()
    }, 1600)

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce on form only
  }, [form, loading, isNew, id])

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (autosaveState === 'pending' || autosaveState === 'saving') {
        e.preventDefault()
        e.returnValue = ''
      } else if (form.title.trim() && JSON.stringify(form) !== lastSavedJson.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [autosaveState, form])

  async function ensurePropertyForUpload(): Promise<string> {
    if (property?.id) return property.id
    if (!isNew && id) return id

    creatingDraft.current = true
    try {
      const latest = formRef.current
      const draftForm = latest.title.trim()
        ? latest
        : {
            ...latest,
            title: 'Untitled listing',
            slug: latest.slug.trim() || slugify('Untitled listing'),
          }
      if (!latest.title.trim()) setForm(draftForm)

      const created = await createProperty(
        {...toPayload(draftForm), published: false},
        user?.id,
      )
      lastSavedJson.current = JSON.stringify(draftForm)
      moveEditorProgress(NEW_PROGRESS_KEY, String(created.id))
      writeEditorProgress(String(created.id), {
        form: draftForm,
        listingStep: listingStepRef.current,
        slugLocked: slugLockedRef.current,
      })
      setProperty(created)
      setAutosaveState('saved')
      return created.id
    } finally {
      creatingDraft.current = false
    }
  }

  async function onUpload(files: File[]) {
    if (!files.length || uploadingImages) return
    const needsRedirect = isNew || !property
    setUploadingImages(true)
    try {
      const propertyId = await ensurePropertyForUpload()
      for (const file of files) {
        const row = await uploadPropertyImage(propertyId, file)
        setImages((prev) => [...prev, row as PropertyImage])
      }
      toast.success(files.length === 1 ? 'Image uploaded' : `${files.length} images uploaded`)
      if (needsRedirect) {
        navigate(`/admin/properties/${propertyId}/edit`, {replace: true})
      }
    } catch (err) {
      console.error('[property images]', err)
      toast.error(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploadingImages(false)
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
            <p className="prop-edit__hint">
              Progress is kept as you go — leave and come back to continue on the same step.
              Reference is assigned automatically when the draft saves.
            </p>
          ) : null}
        </div>

        {resumeBanner ? (
          <div className="prop-edit__resume" role="status">
            <p>
              Continuing from <strong>{LISTING_STEPS.find((s) => s.id === resumeBanner.step)?.label ?? 'your last step'}</strong>
              {resumeBanner.updatedAt
                ? ` · saved ${new Date(resumeBanner.updatedAt).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : ''}
            </p>
            <button type="button" className="prop-edit__resume-discard" onClick={discardUnfinishedProgress}>
              {isNew ? 'Discard & start over' : 'Reset to saved draft'}
            </button>
          </div>
        ) : null}
      </header>

      <form
        className="admin-form prop-edit__form prop-edit__form--wizard"
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          void save()
        }}
      >
        <nav className="prop-edit__steps" aria-label="Listing steps">
          {LISTING_STEPS.map((step, index) => {
            const activeIndex = LISTING_STEPS.findIndex((s) => s.id === listingStep)
            const done = index < activeIndex
            return (
              <button
                key={step.id}
                type="button"
                className={`prop-edit__step${listingStep === step.id ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                onClick={() => goToStep(step.id)}
              >
                <span className="prop-edit__step-index">{index + 1}</span>
                <span className="prop-edit__step-label">{step.label.replace(/^\d+\.\s*/, '')}</span>
              </button>
            )
          })}
        </nav>

        {listingStep === 'category' ? (
          <AdminFormSection
            eyebrow="Step 1"
            title="Choose a category"
            lede="Same as Bazaraki: pick sale or rent, then the property category."
          >
            <div className="prop-edit__category-board">
              <div className="prop-edit__category-col">
                <p className="prop-edit__category-heading">Listing purpose</p>
                {(
                  [
                    ['for_sale', 'Real Estate for sale'],
                    ['for_rent', 'Real Estate to rent'],
                    ['sold', 'Sold'],
                    ['rented', 'Rented'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`prop-edit__category-option${form.status === value ? ' is-selected' : ''}`}
                    onClick={() => setField('status', value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="prop-edit__category-col">
                <p className="prop-edit__category-heading">Property type</p>
                {propertyTypeOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`prop-edit__category-option${form.property_type === t ? ' is-selected' : ''}`}
                    onClick={() => setField('property_type', t)}
                  >
                    {t}
                    {LEGACY_PROPERTY_TYPES.includes(t as (typeof LEGACY_PROPERTY_TYPES)[number]) &&
                    !getBazarakiPropertyTypes(form.status).includes(t)
                      ? ' (legacy)'
                      : ''}
                  </button>
                ))}
              </div>
            </div>
            <div className="prop-edit__step-actions">
              <button type="button" className="admin-btn admin-btn--gold" onClick={() => goToStep('location')}>
                Continue to location
              </button>
            </div>
          </AdminFormSection>
        ) : null}

        {listingStep === 'location' ? (
          <AdminFormSection
            eyebrow="Step 2"
            title="Select location"
            lede="One location for the website and Bazaraki — district, then area. Next you’ll place the pin on the map."
          >
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
                const coords = getDistrictCoordinates(bazarakiDistrictId)
                if (coords) {
                  setField('latitude', String(coords.latitude))
                  setField('longitude', String(coords.longitude))
                } else if (bazarakiDistrictId == null) {
                  setField('latitude', '')
                  setField('longitude', '')
                }
              }}
            />
            <div className="admin-form__grid" style={{marginTop: '0.85rem'}}>
              <div className="admin-field">
                <label>Postal code</label>
                <input
                  value={form.postal_code}
                  onChange={(e) => setField('postal_code', e.target.value)}
                  placeholder="e.g. 4152"
                />
              </div>
            </div>
            <div className="prop-edit__step-actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => goToStep('category')}>
                Back
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--gold"
                disabled={!form.bazaraki_district_id}
                onClick={() => {
                  if (!form.latitude || !form.longitude) {
                    const coords = getDistrictCoordinates(form.bazaraki_district_id)
                    if (coords) {
                      setField('latitude', String(coords.latitude))
                      setField('longitude', String(coords.longitude))
                    }
                  }
                  goToStep('map')
                }}
              >
                Continue to map
              </button>
            </div>
          </AdminFormSection>
        ) : null}

        {listingStep === 'map' ? (
          <AdminFormSection
            eyebrow="Step 3"
            title="Location on the map"
            lede="Drag the pin to the exact spot — same as posting on Bazaraki."
          >
            <PropertyMapPinPicker
              latitude={num(form.latitude)}
              longitude={num(form.longitude)}
              label={
                form.district && form.area
                  ? `${form.district} — ${form.area}`
                  : form.district || undefined
              }
              defaultCenter={(() => {
                const coords = getDistrictCoordinates(form.bazaraki_district_id)
                return coords ? {lat: coords.latitude, lng: coords.longitude} : null
              })()}
              onChange={({latitude, longitude}) => {
                setField('latitude', String(latitude))
                setField('longitude', String(longitude))
              }}
            />
            <div className="prop-edit__step-actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => goToStep('location')}>
                Back to location list
              </button>
              <button type="button" className="admin-btn admin-btn--gold" onClick={() => goToStep('details')}>
                Continue
              </button>
            </div>
          </AdminFormSection>
        ) : null}

        {listingStep === 'details' ? (
          <AdminFormSection
            eyebrow="Step 4"
            title="Property details"
            lede="Fields follow the Bazaraki listing form order for this category."
          >
            <div className="admin-form__grid">
              <div className="admin-field admin-field--full">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setField('title', e.target.value)} required />
              </div>
              <div className="admin-field">
                <label>URL slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setField('slug', e.target.value)}
                  placeholder="auto-filled-from-title"
                />
                <p className="prop-edit__field-hint">
                  {slugLocked
                    ? 'Custom slug locked. '
                    : 'Auto-filled from the title. '}
                  <button type="button" className="prop-edit__text-btn" onClick={resetSlugFromTitle}>
                    Reset from title
                  </button>
                </p>
              </div>
              <div className="admin-field">
                <label>Price (€)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                />
              </div>

              {bazarakiSchema === 'houses' ? (
                <div className="admin-field">
                  <label>Type</label>
                  <select
                    value={form.bazaraki_house_type}
                    onChange={(e) => setField('bazaraki_house_type', e.target.value)}
                  >
                    <option value="">Choose one…</option>
                    {Object.entries(BAZARAKI_HOUSE_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {bazarakiSchema === 'commercial' ? (
                <div className="admin-field">
                  <label>Property type</label>
                  <select
                    value={form.bazaraki_commercial_type}
                    onChange={(e) => setField('bazaraki_commercial_type', e.target.value)}
                  >
                    <option value="">Choose one…</option>
                    {Object.entries(COMMERCIAL_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {bazarakiSchema === 'houses' || bazarakiSchema === 'apartment' ? (
                <>
                  <div className="admin-field">
                    <label>Bedrooms</label>
                    <input
                      type="number"
                      value={form.bedrooms}
                      onChange={(e) => setField('bedrooms', e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Bathrooms</label>
                    <input
                      type="number"
                      value={form.bathrooms}
                      onChange={(e) => setField('bathrooms', e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Parking</label>
                    <select
                      value={form.bazaraki_parking}
                      onChange={(e) => setField('bazaraki_parking', e.target.value)}
                    >
                      <option value="">Choose one…</option>
                      <option value="1">Covered</option>
                      <option value="2">Uncovered</option>
                      <option value="3">No</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Furnishing</label>
                    <select value={form.furnishing} onChange={(e) => setField('furnishing', e.target.value)}>
                      <option value="">Choose one…</option>
                      {FURNISHING_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Air conditioning</label>
                    <select
                      value={form.bazaraki_air_conditioning}
                      onChange={(e) => setField('bazaraki_air_conditioning', e.target.value)}
                    >
                      <option value="">Choose one…</option>
                      <option value="1">Full, all rooms</option>
                      <option value="2">Partly</option>
                      <option value="3">No</option>
                    </select>
                  </div>
                </>
              ) : null}

              <div className="admin-field">
                <label>Condition</label>
                <select value={form.condition} onChange={(e) => setField('condition', e.target.value)}>
                  <option value="">Choose one…</option>
                  {CONDITION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Construction year</label>
                <input
                  type="number"
                  value={form.year_built}
                  onChange={(e) => setField('year_built', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label>Property area (m²)</label>
                <input
                  type="number"
                  value={form.internal_area}
                  onChange={(e) => setField('internal_area', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label>Covered area (m²)</label>
                <input
                  type="number"
                  value={form.covered_area}
                  onChange={(e) => setField('covered_area', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label>Plot area (m²)</label>
                <input
                  type="number"
                  value={form.plot_size}
                  onChange={(e) => setField('plot_size', e.target.value)}
                />
              </div>

              {bazarakiSchema === 'apartment' ? (
                <div className="admin-field">
                  <label>Floor</label>
                  <input type="number" value={form.floor} onChange={(e) => setField('floor', e.target.value)} />
                </div>
              ) : null}

              <div className="admin-field">
                <label>Energy efficiency</label>
                <select
                  value={form.energy_efficiency}
                  onChange={(e) => setField('energy_efficiency', e.target.value)}
                >
                  <option value="">Choose one…</option>
                  {ENERGY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {bazarakiSchema === 'houses' || bazarakiSchema === 'apartment' ? (
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
              ) : null}

              {(bazarakiSchema === 'residentialBuildings' || isPlotsOfLandType(form.property_type)) && (
                <>
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
              )}

              {isPlotsOfLandType(form.property_type) ? (
                <>
                  <div className="admin-field">
                    <label>Land type</label>
                    <select value={form.land_type} onChange={(e) => setField('land_type', e.target.value)}>
                      <option value="">Choose one…</option>
                      {LAND_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Plot type</label>
                    <select value={form.plot_type} onChange={(e) => setField('plot_type', e.target.value)}>
                      <option value="">Choose one…</option>
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
                    <input value={form.coverage} onChange={(e) => setField('coverage', e.target.value)} />
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
                </>
              ) : null}
            </div>

            {bazarakiSchema &&
            bazarakiSchema !== 'prefabricatedHouses' &&
            bazarakiSchema !== 'other' &&
            bazarakiSchema !== 'plotsOfLand' ? (
              <div className="admin-field admin-field--full" style={{marginTop: '0.85rem'}}>
                <label>Included</label>
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

            {bazarakiSchema &&
            bazarakiSchema !== 'prefabricatedHouses' &&
            bazarakiSchema !== 'other' ? (
              <div style={{marginTop: '0.85rem'}}>
                <AdminToggle
                  label="Online viewing"
                  description="Available for online viewing"
                  checked={form.bazaraki_online_viewing}
                  onChange={(checked) => setField('bazaraki_online_viewing', checked)}
                />
              </div>
            ) : null}

            <div className="prop-edit__step-actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => goToStep('map')}>
                Back
              </button>
              <button type="button" className="admin-btn admin-btn--gold" onClick={() => goToStep('media')}>
                Continue to media
              </button>
            </div>
          </AdminFormSection>
        ) : null}

        {listingStep === 'media' ? (
          <>
            <AdminFormSection
              eyebrow="Step 5"
              title="Images"
              lede="Ads with good photos get more attention. First image is the title image."
            >
              <div className="admin-field admin-file-upload">
                <label htmlFor="property-images">Images</label>
                <p className="admin-file-upload__hint">
                  Select one or many photos at once — they upload immediately.
                  {uploadingImages ? ' Uploading…' : ''}
                </p>
                <input
                  id="property-images"
                  className="admin-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingImages}
                  onChange={(e) => {
                    // Copy files before clearing — FileList is live and becomes empty when value is reset.
                    const selected = e.target.files ? Array.from(e.target.files) : []
                    e.target.value = ''
                    void onUpload(selected)
                  }}
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

            <AdminFormSection eyebrow="Content" title="Description" lede="Describe the property. Contact details are not allowed in the description on Bazaraki.">
              <div className="admin-field">
                <label>Short description</label>
                <textarea
                  value={form.short_description}
                  onChange={(e) => setField('short_description', e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label>Description</label>
                <textarea
                  className="admin-textarea--tall"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  maxLength={10000}
                />
                <p className="admin-file-upload__hint">{10000 - form.description.length} chars left</p>
              </div>
              <div className="admin-field">
                <label>Website features (comma-separated)</label>
                <textarea
                  value={form.featuresText}
                  onChange={(e) => setField('featuresText', e.target.value)}
                  placeholder="Pool, Sea view, Covered parking"
                />
              </div>
            </AdminFormSection>

            <div className="prop-edit__step-actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => goToStep('details')}>
                Back
              </button>
              <button type="button" className="admin-btn admin-btn--gold" onClick={() => goToStep('publish')}>
                Continue to publish
              </button>
            </div>
          </>
        ) : null}

        {listingStep === 'publish' ? (
          <>
            <AdminFormSection
              className="admin-publish-section"
              eyebrow="Step 6"
              title="Publishing"
              lede="Location and map pin are already set — they feed both the website and Bazaraki."
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

              {form.bazaraki_district_id != null ? (
                <p className="admin-location-picker__meta" style={{marginTop: '0.85rem'}}>
                  <span>Location for feed</span>
                  <strong>
                    {form.district}
                    {form.area ? ` · ${form.area}` : ''}
                  </strong>
                  <span className="admin-district-picker__meta-value">ID {form.bazaraki_district_id}</span>
                  {form.latitude && form.longitude ? (
                    <span className="admin-district-picker__meta-value">
                      {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="admin-bazaraki-status__warning" style={{marginTop: '0.85rem'}}>
                  No location selected yet — go back to step 2.
                </p>
              )}

              {form.publish_to_bazaraki ? (
                <div className="admin-publish-bazaraki">
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

            <div className="prop-edit__step-actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => goToStep('media')}>
                Back
              </button>
            </div>
          </>
        ) : null}

        <div className="admin-form__toolbar prop-edit__save-toolbar">
          <div className="admin-form__toolbar-inner prop-edit__save-toolbar-inner">
            <p
              className={`prop-edit__autosave prop-edit__autosave--${autosaveState}`}
              aria-live="polite"
            >
              {autosaveState === 'pending'
                ? 'Unsaved changes — autosaving…'
                : autosaveState === 'saving'
                  ? isNew
                    ? 'Saving draft…'
                    : 'Autosaving…'
                  : autosaveState === 'saved'
                    ? isNew
                      ? 'Draft saved'
                      : 'All changes saved'
                    : autosaveState === 'error'
                      ? autosaveError || 'Autosave failed — try Save Draft'
                      : form.title.trim()
                        ? 'Autosave on'
                        : 'Add a title to start autosaving as draft'}
            </p>
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
      latitude: num(form.latitude),
      longitude: num(form.longitude),
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
