import {useMemo, type ReactNode} from 'react'
import {useJsApiLoader} from '@react-google-maps/api'
import {GOOGLE_MAPS_LOADER_ID} from '../lib/maps/googleMaps'
import {GoogleMapsContext} from './googleMapsContext'

type Props = {
  apiKey: string
  requestLoad: () => void
  children: ReactNode
}

export default function GoogleMapsLoader({apiKey, requestLoad, children}: Props) {
  const {isLoaded, loadError} = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    preventGoogleFontsLoading: true,
  })

  const value = useMemo(
    () => ({
      apiKey,
      isLoaded,
      loadError: loadError as Error | undefined,
      requestLoad,
    }),
    [apiKey, isLoaded, loadError, requestLoad],
  )

  return <GoogleMapsContext.Provider value={value}>{children}</GoogleMapsContext.Provider>
}
