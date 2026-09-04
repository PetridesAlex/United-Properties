import {supabase} from '../supabase/client'
import type {PropertyImage} from '../../types/cms'

export type PropertyImageKind = 'gallery' | 'floor_plan'

/** Cached after first PostgREST schema-cache miss — column may not be migrated yet. */
let supportsImageKind: boolean | null = null

function isMissingColumnError(message: string, column: string) {
  const mentionsColumn =
    message.includes(`'${column}'`) ||
    message.includes(`"${column}"`) ||
    message.includes(`.${column}`)
  const looksLikeSchemaMiss =
    message.includes('schema cache') ||
    message.includes('Could not find') ||
    message.includes('does not exist')
  return mentionsColumn && looksLikeSchemaMiss
}

export function validateImageFile(_file: File): string | null {
  return null
}

function fileExtension(file: File): string {
  const fromName = file.name.includes('.')
    ? file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
    : ''
  if (fromName) return fromName
  const subtype = file.type.split('/')[1]?.toLowerCase().replace(/[^a-z0-9]/g, '')
  return subtype || 'bin'
}

export function isGalleryImage(image: Pick<PropertyImage, 'kind'>) {
  return (image.kind || 'gallery') !== 'floor_plan'
}

export function isFloorPlanImage(image: Pick<PropertyImage, 'kind'>) {
  return image.kind === 'floor_plan'
}

export async function uploadPropertyImage(
  propertyId: string,
  file: File,
  kind: PropertyImageKind = 'gallery',
) {
  if (!supabase) throw new Error('Supabase is not configured')

  const ext = fileExtension(file)
  const path = `${propertyId}/${kind === 'floor_plan' ? 'floor-plans/' : ''}${crypto.randomUUID()}.${ext}`
  const contentType = file.type || 'application/octet-stream'

  const {error: uploadError} = await supabase.storage
    .from('properties')
    .upload(path, file, {cacheControl: '3600', upsert: false, contentType})

  if (uploadError) throw new Error(uploadError.message)

  const {data} = supabase.storage.from('properties').getPublicUrl(path)

  async function countImages(filterByKind: boolean) {
    let query = supabase!
      .from('property_images')
      .select('*', {count: 'exact', head: true})
      .eq('property_id', propertyId)
    if (filterByKind) query = query.eq('kind', kind)
    return query
  }

  let count = 0
  if (supportsImageKind !== false) {
    const first = await countImages(true)
    if (first.error && isMissingColumnError(first.error.message, 'kind')) {
      supportsImageKind = false
      const fallback = await countImages(false)
      if (fallback.error) throw new Error(fallback.error.message)
      count = fallback.count ?? 0
    } else if (first.error) {
      throw new Error(first.error.message)
    } else {
      supportsImageKind = true
      count = first.count ?? 0
    }
  } else {
    const fallback = await countImages(false)
    if (fallback.error) throw new Error(fallback.error.message)
    count = fallback.count ?? 0
  }

  const position = count
  const isFeatured = kind === 'gallery' && position === 0

  const baseRow = {
    property_id: propertyId,
    image_url: data.publicUrl,
    storage_path: path,
    alt_text: file.name,
    position,
    is_featured: isFeatured,
  }

  let insertPayload: Record<string, unknown> =
    supportsImageKind === false ? baseRow : {...baseRow, kind}

  let {data: row, error} = await supabase
    .from('property_images')
    .insert(insertPayload)
    .select('*')
    .single()

  if (error && supportsImageKind !== false && isMissingColumnError(error.message, 'kind')) {
    supportsImageKind = false
    insertPayload = baseRow
    ;({data: row, error} = await supabase
      .from('property_images')
      .insert(insertPayload)
      .select('*')
      .single())
  } else if (!error && supportsImageKind !== false) {
    supportsImageKind = true
  }

  if (error) throw new Error(error.message)
  return row as PropertyImage
}

export async function deletePropertyImage(imageId: string, storagePath: string | null) {
  if (!supabase) throw new Error('Supabase is not configured')
  if (storagePath) {
    await supabase.storage.from('properties').remove([storagePath])
  }
  const {error} = await supabase.from('property_images').delete().eq('id', imageId)
  if (error) throw new Error(error.message)
}

export async function setFeaturedImage(propertyId: string, imageId: string) {
  if (!supabase) throw new Error('Supabase is not configured')
  let clearQuery = supabase
    .from('property_images')
    .update({is_featured: false})
    .eq('property_id', propertyId)
  if (supportsImageKind !== false) {
    clearQuery = clearQuery.eq('kind', 'gallery')
  }
  const {error: clearError} = await clearQuery
  if (clearError && supportsImageKind !== false && isMissingColumnError(clearError.message, 'kind')) {
    supportsImageKind = false
    await supabase
      .from('property_images')
      .update({is_featured: false})
      .eq('property_id', propertyId)
  }

  const {error} = await supabase
    .from('property_images')
    .update({is_featured: true})
    .eq('id', imageId)
  if (error) throw new Error(error.message)
}

export async function reorderPropertyImages(
  ordered: {id: string; position: number}[],
) {
  if (!supabase) throw new Error('Supabase is not configured')
  await Promise.all(
    ordered.map((item) =>
      supabase!.from('property_images').update({position: item.position}).eq('id', item.id),
    ),
  )
}

export async function listStorageMedia(bucket: 'properties' | 'site-assets' = 'properties') {
  if (!supabase) return []
  const {data, error} = await supabase.storage.from(bucket).list('', {
    limit: 100,
    sortBy: {column: 'created_at', order: 'desc'},
  })
  if (error) {
    console.warn('[media] list failed', error.message)
    return []
  }
  return data ?? []
}
