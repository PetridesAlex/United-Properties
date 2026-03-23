import { useMemo } from 'react'
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'

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
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-search-panel',
    googleMapsApiKey: apiKey || '',
  })

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
        <p>Add `VITE_GOOGLE_MAPS_API_KEY` in your `.env` file to enable the Cyprus map.</p>
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
        <h3>Google Maps failed to load</h3>
        <p>
          Please check API key restrictions, enabled APIs, and billing in Google Cloud
          Console.
        </p>
      </div>
    )
  }

  return (
    <div className="search-panel-map" aria-label="Cyprus locations map">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={viewport.center}
        zoom={viewport.zoom}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'none',
          scrollwheel: false,
          draggable: false,
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
