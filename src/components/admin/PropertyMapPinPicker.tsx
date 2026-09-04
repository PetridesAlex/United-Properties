import {useEffect, useMemo, useRef} from 'react'
import L from 'leaflet'
import {MapPin} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const CYPRUS = {lat: 35.1264, lng: 33.4299}

type Props = {
  latitude: number | null
  longitude: number | null
  label?: string
  defaultCenter?: {lat: number; lng: number} | null
  onChange: (coords: {latitude: number; longitude: number}) => void
}

/** Brand pin for Leaflet — avoids broken default marker asset paths in Vite. */
const PIN_ICON = L.divIcon({
  className: 'admin-map-pin__leaflet-icon',
  html: `<span class="admin-map-pin__leaflet-marker" aria-hidden="true"></span>`,
  iconSize: [28, 36],
  iconAnchor: [14, 34],
})

function ManualCoordsFallback({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number | null
  longitude: number | null
  onChange: Props['onChange']
}) {
  function applyManual(latStr: string, lngStr: string) {
    const lat = Number(latStr)
    const lng = Number(lngStr)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return
    onChange({latitude: lat, longitude: lng})
  }

  return (
    <div className="admin-form__grid admin-map-pin__manual">
      <div className="admin-field">
        <label htmlFor="admin-map-lat">Latitude</label>
        <input
          id="admin-map-lat"
          type="number"
          inputMode="decimal"
          step="any"
          value={latitude ?? ''}
          onChange={(e) => applyManual(e.target.value, String(longitude ?? ''))}
          placeholder="34.7071"
          autoComplete="off"
        />
      </div>
      <div className="admin-field">
        <label htmlFor="admin-map-lng">Longitude</label>
        <input
          id="admin-map-lng"
          type="number"
          inputMode="decimal"
          step="any"
          value={longitude ?? ''}
          onChange={(e) => applyManual(String(latitude ?? ''), e.target.value)}
          placeholder="33.0226"
          autoComplete="off"
        />
      </div>
    </div>
  )
}

export default function PropertyMapPinPicker({
  latitude,
  longitude,
  label,
  defaultCenter,
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const hasPin = latitude != null && longitude != null
  const center = useMemo(() => {
    if (hasPin) return {lat: latitude!, lng: longitude!}
    if (defaultCenter) return defaultCenter
    return CYPRUS
  }, [hasPin, latitude, longitude, defaultCenter])

  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return undefined

    const map = L.map(el, {
      center: [center.lat, center.lng],
      zoom: hasPin || defaultCenter ? 14 : 8,
      scrollWheelZoom: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      onChangeRef.current({latitude: e.latlng.lat, longitude: e.latlng.lng})
    })

    mapRef.current = map

    const ro = new ResizeObserver(() => {
      map.invalidateSize({animate: false})
    })
    ro.observe(el)
    requestAnimationFrame(() => map.invalidateSize({animate: false}))
    window.setTimeout(() => map.invalidateSize({animate: false}), 120)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Mount once — center/pin sync happens in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    map.setView([center.lat, center.lng], map.getZoom(), {animate: false})

    if (!hasPin) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }

    const latLng: L.LatLngExpression = [latitude!, longitude!]
    if (!markerRef.current) {
      markerRef.current = L.marker(latLng, {icon: PIN_ICON, draggable: true})
        .addTo(map)
        .on('dragend', () => {
          const pos = markerRef.current?.getLatLng()
          if (!pos) return
          onChangeRef.current({latitude: pos.lat, longitude: pos.lng})
        })
    } else {
      markerRef.current.setLatLng(latLng)
    }
  }, [center.lat, center.lng, hasPin, latitude, longitude])

  return (
    <div className="admin-map-pin">
      {label ? (
        <p className="admin-map-pin__label">
          <MapPin size={16} aria-hidden />
          <span>{label}</span>
        </p>
      ) : null}
      <div className="admin-map-pin__canvas">
        <div ref={containerRef} className="admin-map-pin__map" role="presentation" />
        <div className="admin-map-pin__hint" role="status">
          {hasPin
            ? 'Drag the pin to the exact spot.'
            : 'Tap or click the map to drop a pin, then drag to fine-tune.'}
        </div>
      </div>
      <p className="admin-map-pin__coords">
        {hasPin ? (
          <>
            {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
          </>
        ) : (
          'No pin yet — tap or click the map to place one.'
        )}
      </p>
      <details className="admin-map-pin__manual-details">
        <summary>Enter coordinates manually</summary>
        <ManualCoordsFallback latitude={latitude} longitude={longitude} onChange={onChange} />
      </details>
    </div>
  )
}
