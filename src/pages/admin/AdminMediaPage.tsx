import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {supabase} from '../../lib/supabase/client'
import {listStorageMedia} from '../../lib/properties/images'
import '../../components/admin/AdminShell.css'

type MediaItem = {
  id: string
  image_url: string
  property_id: string
  alt_text: string | null
}

export default function AdminMediaPage() {
  const [images, setImages] = useState<MediaItem[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [dbImages, storage] = await Promise.all([
        supabase
          ? supabase
              .from('property_images')
              .select('id, image_url, property_id, alt_text')
              .order('created_at', {ascending: false})
              .limit(120)
          : Promise.resolve({data: []}),
        listStorageMedia('properties'),
      ])
      if (cancelled) return
      setImages((dbImages.data ?? []) as MediaItem[])
      setFolders(storage.map((item) => item.name).filter(Boolean))
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Media</h1>
          <p className="admin-page__lede">Browse uploaded property images and storage folders.</p>
        </div>
      </header>
      {loading ? <p className="admin-empty">Loading media…</p> : null}
      <div className="admin-card">
        <h2>Storage folders</h2>
        {folders.length === 0 ? (
          <p className="admin-empty">No folders yet.</p>
        ) : (
          <ul>
            {folders.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="admin-card">
        <h2>Property images</h2>
        <div className="admin-images">
          {images.map((img) => (
            <div className="admin-image-tile" key={img.id}>
              <img src={img.image_url} alt={img.alt_text || ''} />
              <div className="admin-image-tile__actions">
                <Link to={`/admin/properties/${img.property_id}/edit`}>Open property</Link>
              </div>
            </div>
          ))}
        </div>
        {!loading && images.length === 0 ? (
          <p className="admin-empty">No images uploaded yet.</p>
        ) : null}
      </div>
    </div>
  )
}
