import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {GoogleMap} from '@react-google-maps/api'
import {ExternalLink, MapPin} from 'lucide-react'
import {triggerMapResize} from '../../lib/maps/googleMaps'
import {useGoogleMapsLoader} from '../../providers/GoogleMapsProvider'
import OsmLocationMap from '../maps/OsmLocationMap'
import './PropertyLocationMap.css'

type Props = {
  latitude: number
  longitude: number
  title: string
  locationLabel?: string
  heading?: string
  lede?: string
  zoom?: number
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
} as const

/** Brand pin — reliable SVG marker (classic MarkerF can fail to paint after resize). */
function buildPinIcon(): google.maps.Icon | undefined {
  if (typeof google === 'undefined') return undefined
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56" fill="none">
      <path d="M24 54s18-16.2 18-30.5C42 12.4 34 4 24 4S6 12.4 6 23.5C6 37.8 24 54 24 54Z"
        fill="#BF9875" stroke="#1A120C" stroke-width="2"/>
      <circle cx="24" cy="23" r="8" fill="#FFF8EF" stroke="#1A120C" stroke-width="1.5"/>
      <circle cx="24" cy="23" r="3.5" fill="#BF9875"/>
    </svg>
  `.trim())
  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg}`,
    scaledSize: new google.maps.Size(44, 52),
    anchor: new google.maps.Point(22, 52),
  }
}

export default function PropertyLocationMap({
  latitude,
  longitude,
  title,
  locationLabel,
  heading = 'Location',
  lede = 'Exact pin from the listing — explore the neighbourhood on the map.',
  zoom = 15,
}: Props) {
  const {apiKey, isLoaded, loadError} = useGoogleMapsLoader()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

  const position = useMemo(() => ({lat: latitude, lng: longitude}), [latitude, longitude])
  const mapsUrl = useMemo(
    () =>
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${latitude},${longitude}`,
      )}`,
    [latitude, longitude],
  )

  const syncPin = useCallback(
    (map: google.maps.Map) => {
      const icon = buildPinIcon()
      if (!markerRef.current) {
        markerRef.current = new google.maps.Marker({
          map,
          position,
          title,
          icon,
          optimized: false,
          zIndex: 999,
        })
      } else {
        markerRef.current.setMap(map)
        markerRef.current.setPosition(position)
        markerRef.current.setTitle(title)
        if (icon) markerRef.current.setIcon(icon)
      }
      map.setCenter(position)
      map.setZoom(zoom)
      triggerMapResize(map)
      window.requestAnimationFrame(() => {
        map.setCenter(position)
        triggerMapResize(map)
      })
    },
    [position, title, zoom],
  )

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map
      setMapInstance(map)
      syncPin(map)
      window.setTimeout(() => syncPin(map), 120)
      window.setTimeout(() => syncPin(map), 400)
    },
    [syncPin],
  )

  const onMapUnmount = useCallback(() => {
    markerRef.current?.setMap(null)
    markerRef.current = null
    mapRef.current = null
    setMapInstance(null)
  }, [])

  useEffect(() => {
    if (!mapInstance) return
    syncPin(mapInstance)
  }, [mapInstance, syncPin])

  useEffect(() => {
    if (!mapInstance || !containerRef.current) return undefined
    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      if (!mapRef.current) return
      syncPin(mapRef.current)
    })
    ro.observe(el)
    const onWinResize = () => {
      if (!mapRef.current) return
      syncPin(mapRef.current)
    }
    window.addEventListener('resize', onWinResize)
    window.addEventListener('orientationchange', onWinResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onWinResize)
      window.removeEventListener('orientationchange', onWinResize)
    }
  }, [mapInstance, syncPin])

  useEffect(() => {
    return () => {
      markerRef.current?.setMap(null)
      markerRef.current = null
    }
  }, [])

  return (
    <section className="property-location-map" aria-labelledby="property-location-heading">
      <header className="property-location-map__head">
        <div className="property-location-map__head-copy">
          <span className="property-location-map__eyebrow">
            <MapPin size={14} strokeWidth={2.2} aria-hidden />
            On the map
          </span>
          <h4 id="property-location-heading">{heading}</h4>
          <p>{lede}</p>
          {locationLabel ? (
            <p className="property-location-map__place">
              <MapPin size={14} strokeWidth={2.1} aria-hidden />
              {locationLabel}
            </p>
          ) : null}
        </div>
        <a
          className="property-location-map__open"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={15} strokeWidth={2.1} aria-hidden />
          Open in Google Maps
        </a>
      </header>

      <div className="property-location-map__canvas-wrap">
        {!apiKey || loadError ? (
          <OsmLocationMap
            className="property-location-map__canvas property-location-map__canvas--osm"
            latitude={latitude}
            longitude={longitude}
            title={title}
            zoom={zoom}
          />
        ) : !isLoaded ? (
          <div className="property-location-map__fallback">
            <p>Loading map…</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="property-location-map__canvas"
            aria-label={`${title} location map`}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={position}
              zoom={zoom}
              onLoad={onMapLoad}
              onUnmount={onMapUnmount}
              options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                clickableIcons: false,
                gestureHandling: 'cooperative',
                scrollwheel: false,
                zoomControl: true,
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{visibility: 'off'}],
                  },
                  {
                    featureType: 'transit',
                    elementType: 'labels.icon',
                    stylers: [{visibility: 'off'}],
                  },
                ],
              }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
