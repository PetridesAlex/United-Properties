/** Shared Google Maps loader config — one script tag for the whole app. */
export const GOOGLE_MAPS_LOADER_ID = 'google-map-script-united-properties'

export function getGoogleMapsApiKey(): string {
  const raw = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  return typeof raw === 'string' ? raw.trim() : ''
}

export function triggerMapResize(map: google.maps.Map | null | undefined) {
  if (!map || typeof google === 'undefined') return
  google.maps.event.trigger(map, 'resize')
}
