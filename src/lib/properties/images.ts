import {supabase} from '../supabase/client'
import type {PropertyImage} from '../../types/cms'

export type PropertyImageKind = 'gallery' | 'floor_plan'

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

  const {count} = await supabase
    .from('property_images')
    .select('*', {count: 'exact', head: true})
    .eq('property_id', propertyId)
    .eq('kind', kind)

  const position = count ?? 0
  const isFeatured = kind === 'gallery' && position === 0

  const {data: row, error} = await supabase
    .from('property_images')
    .insert({
      property_id: propertyId,
      image_url: data.publicUrl,
      storage_path: path,
      alt_text: file.name,
      position,
      is_featured: isFeatured,
      kind,
    })
    .select('*')
    .single()

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
  await supabase
    .from('property_images')
    .update({is_featured: false})
    .eq('property_id', propertyId)
    .eq('kind', 'gallery')
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
