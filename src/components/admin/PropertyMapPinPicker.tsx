import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {GoogleMap, MarkerF} from '@react-google-maps/api'
import {MapPin} from 'lucide-react'
import {triggerMapResize} from '../../lib/maps/googleMaps'
import {useGoogleMapsLoader} from '../../providers/GoogleMapsProvider'

const CYPRUS = {lat: 35.1264, lng: 33.4299}

type Props = {
  latitude: number | null
  longitude: number | null
  label?: string
  defaultCenter?: {lat: number; lng: number} | null
  onChange: (coords: {latitude: number; longitude: number}) => void
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
} as const

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
    onChange({latitude: lat, longitude: lng})
  }

  return (
    <div className="admin-form__grid">
      <div className="admin-field">
        <label>Latitude</label>
        <input
          type="number"
          step="any"
          value={latitude ?? ''}
          onChange={(e) => applyManual(e.target.value, String(longitude ?? ''))}
          placeholder="34.7071"
        />
      </div>
      <div className="admin-field">
        <label>Longitude</label>
        <input
          type="number"
          step="any"
          value={longitude ?? ''}
          onChange={(e) => applyManual(String(latitude ?? ''), e.target.value)}
          placeholder="33.0226"
        />
      </div>
    </div>
  )
}

function MapsSetupHelp({reason}: {reason: 'missing' | 'load' | 'auth'}) {
  if (reason === 'missing') {
    return (
      <p>
        Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> file (and Vercel env for
        production), then restart the dev server. You can still set coordinates manually:
      </p>
    )
  }

  return (
    <>
      <p>
        Google Maps could not load. In Google Cloud Console, enable <strong>Maps JavaScript API</strong>
        , turn on billing, and allow these referrers on your API key:
      </p>
      <ul className="admin-map-pin__help-list">
        <li>
          <code>http://localhost:*</code>
        </li>
        <li>
          <code>https://your-production-domain/*</code>
        </li>
      </ul>
      <p>You can still set coordinates manually below.</p>
    </>
  )
}

export default function PropertyMapPinPicker({
  latitude,
  longitude,
  label,
  defaultCenter,
  onChange,
}: Props) {
  const {apiKey, isLoaded, loadError} = useGoogleMapsLoader()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [authError, setAuthError] = useState(false)

  const hasPin = latitude != null && longitude != null
  const center = useMemo(() => {
    if (hasPin) return {lat: latitude!, lng: longitude!}
    if (defaultCenter) return defaultCenter
    return CYPRUS
  }, [hasPin, latitude, longitude, defaultCenter])

  const scheduleResize = useCallback((map: google.maps.Map | null | undefined) => {
    if (!map) return
    triggerMapResize(map)
    requestAnimationFrame(() => triggerMapResize(map))
    window.setTimeout(() => triggerMapResize(map), 120)
    window.setTimeout(() => triggerMapResize(map), 400)
  }, [])

  const onLoad = useCallback(
    (instance: google.maps.Map) => {
      mapRef.current = instance
      scheduleResize(instance)
      instance.panTo(center)
    },
    [center, scheduleResize],
  )

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.panTo(center)
    scheduleResize(mapRef.current)
  }, [center, scheduleResize])

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return

    const root = containerRef.current
    const detectAuthError = () => {
      const hasError = Boolean(root.querySelector('.gm-err-container'))
      setAuthError(hasError)
    }

    detectAuthError()
    const observer = new MutationObserver(detectAuthError)
    observer.observe(root, {childList: true, subtree: true, characterData: true})
    const timer = window.setTimeout(detectAuthError, 600)

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [isLoaded])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !containerRef.current) return undefined

    const el = containerRef.current
    const ro = new ResizeObserver(() => scheduleResize(mapRef.current))
    ro.observe(el)
    scheduleResize(mapRef.current)

    return () => ro.disconnect()
  }, [isLoaded, scheduleResize])

  if (!apiKey) {
    return (
      <div className="admin-map-pin">
        {label ? (
          <p className="admin-map-pin__label">
            <MapPin size={16} aria-hidden />
            <span>{label}</span>
          </p>
        ) : null}
        <div className="admin-map-pin__fallback">
          <MapsSetupHelp reason="missing" />
          <ManualCoordsFallback latitude={latitude} longitude={longitude} onChange={onChange} />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="admin-map-pin">
        {label ? (
          <p className="admin-map-pin__label">
            <MapPin size={16} aria-hidden />
            <span>{label}</span>
          </p>
        ) : null}
        <div className="admin-map-pin__fallback">
          <MapsSetupHelp reason="load" />
          <p className="admin-map-pin__error-detail">{loadError.message}</p>
          <ManualCoordsFallback latitude={latitude} longitude={longitude} onChange={onChange} />
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="admin-map-pin">
        <div className="admin-map-pin__fallback">
          <p>Loading map…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-map-pin">
      {label ? (
        <p className="admin-map-pin__label">
          <MapPin size={16} aria-hidden />
          <span>{label}</span>
        </p>
      ) : null}
      <div ref={containerRef} className="admin-map-pin__canvas">
        {authError ? (
          <div className="admin-map-pin__auth-banner" role="alert">
            <MapsSetupHelp reason="auth" />
          </div>
        ) : null}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={hasPin || defaultCenter ? 14 : 8}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={(e) => {
            const lat = e.latLng?.lat()
            const lng = e.latLng?.lng()
            if (lat == null || lng == null) return
            onChange({latitude: lat, longitude: lng})
          }}
          options={{
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            clickableIcons: false,
            gestureHandling: 'greedy',
          }}
        >
          {hasPin ? (
            <MarkerF
              position={{lat: latitude!, lng: longitude!}}
              draggable
              onDragEnd={(e) => {
                const lat = e.latLng?.lat()
                const lng = e.latLng?.lng()
                if (lat == null || lng == null) return
                onChange({latitude: lat, longitude: lng})
              }}
            />
          ) : null}
        </GoogleMap>
        <div className="admin-map-pin__hint" role="status">
          {hasPin ? 'Drag the pin to the exact spot.' : 'Click the map to drop a pin, then drag to fine-tune.'}
        </div>
      </div>
      <p className="admin-map-pin__coords">
        {hasPin ? (
          <>
            {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
          </>
        ) : (
          'No pin yet — click the map to place one.'
        )}
      </p>
    </div>
  )
}
