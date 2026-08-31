import {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {
  Copy,
  ExternalLink,
  FolderOpen,
  ImageIcon,
  Images,
  Search,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {supabase} from '../../lib/supabase/client'
import {listStorageMedia} from '../../lib/properties/images'
import '../../components/admin/AdminShell.css'
import './AdminMediaPage.css'

type PropertyRef = {
  id: string
  title: string
  reference_number: string
  slug: string
  city: string | null
  area: string | null
  published: boolean
}

type MediaItem = {
  id: string
  image_url: string
  property_id: string
  alt_text: string | null
  position: number
  is_featured: boolean
  created_at: string
  properties: PropertyRef | PropertyRef[] | null
}

function propertyOf(img: MediaItem): PropertyRef | null {
  if (!img.properties) return null
  return Array.isArray(img.properties) ? img.properties[0] ?? null : img.properties
}

export default function AdminMediaPage() {
  const [images, setImages] = useState<MediaItem[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'listings' | 'gallery'>('listings')
  const [activeFolder, setActiveFolder] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [dbImages, storage] = await Promise.all([
        supabase
          ? supabase
              .from('property_images')
              .select(
                `
                id,
                image_url,
                property_id,
                alt_text,
                position,
                is_featured,
                created_at,
                properties (
                  id,
                  title,
                  reference_number,
                  slug,
                  city,
                  area,
                  published
                )
              `,
              )
              .order('created_at', {ascending: false})
              .limit(240)
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return images.filter((img) => {
      if (activeFolder && img.property_id !== activeFolder) return false
      if (!q) return true
      const prop = propertyOf(img)
      const hay = [
        prop?.title,
        prop?.reference_number,
        prop?.city,
        prop?.area,
        img.alt_text,
        img.property_id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [images, search, activeFolder])

  const groups = useMemo(() => {
    const map = new Map<
      string,
      {property: PropertyRef | null; propertyId: string; images: MediaItem[]}
    >()
    for (const img of filtered) {
      const existing = map.get(img.property_id)
      if (existing) {
        existing.images.push(img)
        continue
      }
      map.set(img.property_id, {
        propertyId: img.property_id,
        property: propertyOf(img),
        images: [img],
      })
    }
    return [...map.values()].sort((a, b) => {
      const aDate = a.images[0]?.created_at ?? ''
      const bDate = b.images[0]?.created_at ?? ''
      return bDate.localeCompare(aDate)
    })
  }, [filtered])

  const stats = useMemo(() => {
    const featured = images.filter((i) => i.is_featured).length
    const listingCount = new Set(images.map((i) => i.property_id)).size
    return {
      images: images.length,
      listings: listingCount,
      featured,
      folders: folders.length,
    }
  }, [images, folders])

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url).then(() => toast.success('Image URL copied'))
  }

  return (
    <div className="admin-page media-admin">
      <header className="admin-page__header media-admin__header">
        <div>
          <p className="media-admin__eyebrow">Library</p>
          <h1>Media</h1>
          <p className="admin-page__lede">
            All property photos in one place — find a listing, copy a URL, or jump straight to
            edit.
          </p>
        </div>
        <Link className="admin-btn admin-btn--gold" to="/admin/properties/new">
          Add listing photos
        </Link>
      </header>

      <div className="media-admin__stats" role="list">
        <div className="media-admin__stat" role="listitem">
          <span>Images</span>
          <strong>{stats.images}</strong>
        </div>
        <div className="media-admin__stat" role="listitem">
          <span>Listings with photos</span>
          <strong>{stats.listings}</strong>
        </div>
        <div className="media-admin__stat" role="listitem">
          <span>Main images</span>
          <strong>{stats.featured}</strong>
        </div>
        <div className="media-admin__stat" role="listitem">
          <span>Storage folders</span>
          <strong>{stats.folders}</strong>
        </div>
      </div>

      <div className="media-admin__toolbar">
        <label className="media-admin__search">
          <Search size={16} aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, reference, city…"
            aria-label="Search media"
          />
        </label>
        <div className="media-admin__views" role="tablist" aria-label="Media view">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'listings'}
            className={`media-admin__view${view === 'listings' ? ' is-active' : ''}`}
            onClick={() => setView('listings')}
          >
            <FolderOpen size={14} aria-hidden />
            By listing
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'gallery'}
            className={`media-admin__view${view === 'gallery' ? ' is-active' : ''}`}
            onClick={() => setView('gallery')}
          >
            <Images size={14} aria-hidden />
            Gallery
          </button>
        </div>
      </div>

      {folders.length > 0 ? (
        <section className="media-admin__folders" aria-label="Filter by storage folder">
          <button
            type="button"
            className={`media-admin__folder${activeFolder == null ? ' is-active' : ''}`}
            onClick={() => setActiveFolder(null)}
          >
            All folders
          </button>
          {folders.map((name) => (
            <button
              key={name}
              type="button"
              className={`media-admin__folder${activeFolder === name ? ' is-active' : ''}`}
              onClick={() => setActiveFolder((prev) => (prev === name ? null : name))}
              title={name}
            >
              <FolderOpen size={13} aria-hidden />
              <span>{name.length > 10 ? `${name.slice(0, 8)}…` : name}</span>
            </button>
          ))}
        </section>
      ) : null}

      <section className="media-admin__panel" aria-live="polite">
        {loading ? (
          <p className="admin-empty">Loading media…</p>
        ) : filtered.length === 0 ? (
          <div className="media-admin__empty">
            <ImageIcon size={22} aria-hidden />
            <p>{images.length === 0 ? 'No images uploaded yet.' : 'No images match this filter.'}</p>
            <Link className="admin-btn admin-btn--gold" to="/admin/properties">
              Open listings
            </Link>
          </div>
        ) : view === 'gallery' ? (
          <div className="media-admin__gallery">
            {filtered.map((img) => {
              const prop = propertyOf(img)
              return (
                <article key={img.id} className="media-admin__tile">
                  <div className="media-admin__tile-media">
                    <img src={img.image_url} alt={img.alt_text || prop?.title || ''} />
                    {img.is_featured ? (
                      <span className="media-admin__badge">
                        <Sparkles size={11} aria-hidden /> Main
                      </span>
                    ) : null}
                  </div>
                  <div className="media-admin__tile-body">
                    <p className="media-admin__tile-ref">
                      {prop?.reference_number || 'Listing'}
                    </p>
                    <h3>{prop?.title || 'Untitled property'}</h3>
                    <div className="media-admin__tile-actions">
                      <button type="button" onClick={() => copyUrl(img.image_url)}>
                        <Copy size={13} aria-hidden />
                        Copy URL
                      </button>
                      <Link to={`/admin/properties/${img.property_id}/edit`}>Edit</Link>
                      {prop?.published && prop.slug ? (
                        <a href={`/properties/${prop.slug}`} target="_blank" rel="noreferrer">
                          <ExternalLink size={13} aria-hidden />
                          Site
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <ul className="media-admin__groups">
            {groups.map((group) => {
              const prop = group.property
              const cover =
                group.images.find((i) => i.is_featured)?.image_url || group.images[0]?.image_url
              const location = [prop?.area, prop?.city].filter(Boolean).join(', ')
              return (
                <li key={group.propertyId} className="media-admin__group">
                  <div className="media-admin__group-head">
                    <div className="media-admin__group-cover">
                      {cover ? (
                        <img src={cover} alt="" />
                      ) : (
                        <div className="media-admin__group-fallback" aria-hidden>
                          UP
                        </div>
                      )}
                    </div>
                    <div className="media-admin__group-meta">
                      <div className="media-admin__group-top">
                        <span className="media-admin__ref">
                          {prop?.reference_number || group.propertyId.slice(0, 8)}
                        </span>
                        <span className="media-admin__chip">
                          {group.images.length} photo{group.images.length === 1 ? '' : 's'}
                        </span>
                        {prop?.published ? (
                          <span className="media-admin__chip media-admin__chip--on">Published</span>
                        ) : (
                          <span className="media-admin__chip">Draft / unpublished</span>
                        )}
                      </div>
                      <h2>
                        <Link to={`/admin/properties/${group.propertyId}/edit`}>
                          {prop?.title || 'Untitled property'}
                        </Link>
                      </h2>
                      {location ? <p className="media-admin__location">{location}</p> : null}
                      <div className="media-admin__group-actions">
                        <Link
                          className="admin-btn admin-btn--gold"
                          to={`/admin/properties/${group.propertyId}/edit`}
                        >
                          Manage photos
                        </Link>
                        {prop?.published && prop.slug ? (
                          <a
                            className="admin-btn admin-btn--ghost"
                            href={`/properties/${prop.slug}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View site
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="media-admin__thumbs">
                    {group.images
                      .slice()
                      .sort((a, b) => a.position - b.position)
                      .map((img) => (
                        <div key={img.id} className="media-admin__thumb">
                          <img src={img.image_url} alt={img.alt_text || ''} />
                          {img.is_featured ? (
                            <span className="media-admin__badge">
                              <Sparkles size={10} aria-hidden /> Main
                            </span>
                          ) : null}
                          <div className="media-admin__thumb-actions">
                            <button type="button" onClick={() => copyUrl(img.image_url)}>
                              Copy URL
                            </button>
                            <a href={img.image_url} target="_blank" rel="noreferrer">
                              Open
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
