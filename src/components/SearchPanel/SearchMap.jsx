import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleMap, MarkerF } from '@react-google-maps/api'
import { triggerMapResize } from '../../lib/maps/googleMaps'
import { useGoogleMapsLoader } from '../../providers/GoogleMapsProvider'

const cyprusMapDefaults = {
  center: { lat: 35.1264, lng: 33.4299 },
  zoom: 8,
}

const cityCoordinates = {
  Limassol: { lat: 34.7071, lng: 33.0226 },
  Nicosia: { lat: 35.1856, lng: 33.3823 },
  Paphos: { lat: 34.772, lng: 32.4297 },
  Larnaca: { lat: 34.9003, lng: 33.6232 },
  Protaras: { lat: 35.0125, lng: 34.0582 },
  'Ayia Napa': { lat: 34.988, lng: 34.0018 },
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
}

function getMapViewport(activeCity) {
  if (!activeCity || activeCity === 'All Cyprus') return cyprusMapDefaults
  const center = cityCoordinates[activeCity] || cyprusMapDefaults.center
  return {
    center,
    zoom: 11,
  }
}

function SearchMap({ properties, activeCity }) {
  const { apiKey, isLoaded, loadError } = useGoogleMapsLoader()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const mapListenersCleanupRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const onMapLoad = useCallback((map) => {
    mapRef.current = map
    setMapInstance(map)
    const resize = () => triggerMapResize(mapRef.current)
    resize()
    requestAnimationFrame(resize)
    const t1 = window.setTimeout(resize, 120)
    const t2 = window.setTimeout(resize, 400)
    const onWinResize = () => resize()
    window.addEventListener('resize', onWinResize)
    window.addEventListener('orientationchange', onWinResize)
    window.visualViewport?.addEventListener('resize', onWinResize)
    mapListenersCleanupRef.current = () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('resize', onWinResize)
      window.removeEventListener('orientationchange', onWinResize)
      window.visualViewport?.removeEventListener('resize', onWinResize)
    }
  }, [])

  const onMapUnmount = useCallback(() => {
    mapListenersCleanupRef.current?.()
    mapListenersCleanupRef.current = null
    mapRef.current = null
    setMapInstance(null)
  }, [])

  useEffect(() => {
    if (!mapInstance || !containerRef.current) return undefined
    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      triggerMapResize(mapRef.current)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [mapInstance])

  const markers = useMemo(
    () =>
      properties
        .map((property) => {
          const position = cityCoordinates[property.city]
          if (!position) return null
          return {
            id: property.id,
            title: `${property.title} - ${property.city}`,
            position,
          }
        })
        .filter(Boolean),
    [properties],
  )

  const viewport = useMemo(() => getMapViewport(activeCity), [activeCity])

  if (!apiKey) {
    return (
      <div className="search-panel-map search-panel-map--fallback">
        <h3>Map preview unavailable</h3>
        <p>The Cyprus map will appear here once Maps access is restored on the live site.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="search-panel-map search-panel-map--fallback">
        <h3>Loading map...</h3>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="search-panel-map search-panel-map--fallback">
        <h3>Map could not load</h3>
        <p>Please try again in a moment. You can still browse listings in the list view.</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="search-panel-map search-panel-map--live" aria-label="Cyprus locations map">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={viewport.center}
        zoom={viewport.zoom}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          /* One-finger drags scroll the parent panel; two fingers pan/zoom the map (native app-like). */
          gestureHandling: 'cooperative',
          scrollwheel: false,
          draggable: true,
          zoomControl: true,
        }}
      >
        {markers.map((marker) => (
          <MarkerF key={marker.id} position={marker.position} title={marker.title} />
        ))}
      </GoogleMap>
    </div>
  )
}

export default SearchMap
