import {supabase} from '../supabase/client'

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function validateImageFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) return 'Use JPG, PNG, WebP, or GIF images.'
  if (file.size > MAX_BYTES) return 'Each image must be under 10 MB.'
  return null
}

export async function uploadPropertyImage(propertyId: string, file: File) {
  if (!supabase) throw new Error('Supabase is not configured')
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${propertyId}/${crypto.randomUUID()}.${ext}`

  const {error: uploadError} = await supabase.storage
    .from('properties')
    .upload(path, file, {cacheControl: '3600', upsert: false, contentType: file.type})

  if (uploadError) throw new Error(uploadError.message)

  const {data} = supabase.storage.from('properties').getPublicUrl(path)

  const {count} = await supabase
    .from('property_images')
    .select('*', {count: 'exact', head: true})
    .eq('property_id', propertyId)

  const position = count ?? 0
  const isFeatured = position === 0

  const {data: row, error} = await supabase
    .from('property_images')
    .insert({
      property_id: propertyId,
      image_url: data.publicUrl,
      storage_path: path,
      alt_text: file.name,
      position,
      is_featured: isFeatured,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return row
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
