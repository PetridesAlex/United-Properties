import {useCallback, useEffect, useMemo, useState} from 'react'
import {GoogleMap, MarkerF, useJsApiLoader} from '@react-google-maps/api'
import {MapPin} from 'lucide-react'

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

export default function PropertyMapPinPicker({
  latitude,
  longitude,
  label,
  defaultCenter,
  onChange,
}: Props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const {isLoaded, loadError} = useJsApiLoader({
    id: 'google-map-script-search-panel',
    googleMapsApiKey: apiKey || '',
  })

  const hasPin = latitude != null && longitude != null
  const center = useMemo(() => {
    if (hasPin) return {lat: latitude!, lng: longitude!}
    if (defaultCenter) return defaultCenter
    return CYPRUS
  }, [hasPin, latitude, longitude, defaultCenter])

  const [map, setMap] = useState<google.maps.Map | null>(null)

  useEffect(() => {
    if (!map) return
    map.panTo(center)
  }, [map, center.lat, center.lng])

  const onLoad = useCallback((instance: google.maps.Map) => {
    setMap(instance)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  function applyManual(latStr: string, lngStr: string) {
    const lat = Number(latStr)
    const lng = Number(lngStr)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    onChange({latitude: lat, longitude: lng})
  }

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
          <p>
            Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to enable the drag-pin map. You can still set
            coordinates manually:
          </p>
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
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="admin-map-pin">
        <div className="admin-map-pin__fallback">
          <p>Google Maps failed to load. Check the API key and billing settings.</p>
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
      <div className="admin-map-pin__canvas">
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
          Please drag the pin to the exact spot.
        </div>
      </div>
      <p className="admin-map-pin__coords">
        {hasPin ? (
          <>
            {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
          </>
        ) : (
          'Click the map to drop a pin, then drag to fine-tune.'
        )}
      </p>
    </div>
  )
}
