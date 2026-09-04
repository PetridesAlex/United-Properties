import {useEffect, useRef} from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Props = {
  latitude: number
  longitude: number
  title: string
  zoom?: number
  className?: string
}

const PIN_ICON = L.divIcon({
  className: 'osm-location-map__icon',
  html: `<span class="osm-location-map__marker" aria-hidden="true"></span>`,
  iconSize: [28, 36],
  iconAnchor: [14, 34],
})

/** Read-only OpenStreetMap pin — used when Google Maps is unavailable. */
export default function OsmLocationMap({
  latitude,
  longitude,
  title,
  zoom = 15,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    const map = L.map(el, {
      center: [latitude, longitude],
      zoom,
      scrollWheelZoom: false,
      dragging: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.marker([latitude, longitude], {icon: PIN_ICON, title}).addTo(map)

    const ro = new ResizeObserver(() => map.invalidateSize({animate: false}))
    ro.observe(el)
    requestAnimationFrame(() => map.invalidateSize({animate: false}))

    return () => {
      ro.disconnect()
      map.remove()
    }
  }, [latitude, longitude, title, zoom])

  return (
    <div
      ref={containerRef}
      className={className ? `osm-location-map ${className}` : 'osm-location-map'}
      aria-label={`${title} location map`}
    />
  )
}
