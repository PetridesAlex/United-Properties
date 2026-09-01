import {createContext, useContext, type ReactNode} from 'react'
import {useJsApiLoader} from '@react-google-maps/api'
import {getGoogleMapsApiKey, GOOGLE_MAPS_LOADER_ID} from '../lib/maps/googleMaps'

type GoogleMapsContextValue = {
  apiKey: string
  isLoaded: boolean
  loadError: Error | undefined
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  apiKey: '',
  isLoaded: false,
  loadError: undefined,
})

function GoogleMapsProviderInner({apiKey, children}: {apiKey: string; children: ReactNode}) {
  const {isLoaded, loadError} = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    preventGoogleFontsLoading: true,
  })

  return (
    <GoogleMapsContext.Provider
      value={{apiKey, isLoaded, loadError: loadError as Error | undefined}}
    >
      {children}
    </GoogleMapsContext.Provider>
  )
}

export function GoogleMapsProvider({children}: {children: ReactNode}) {
  const apiKey = getGoogleMapsApiKey()

  if (!apiKey) {
    return (
      <GoogleMapsContext.Provider value={{apiKey: '', isLoaded: false, loadError: undefined}}>
        {children}
      </GoogleMapsContext.Provider>
    )
  }

  return <GoogleMapsProviderInner apiKey={apiKey}>{children}</GoogleMapsProviderInner>
}

export function useGoogleMapsLoader() {
  return useContext(GoogleMapsContext)
}
