import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {useJsApiLoader} from '@react-google-maps/api'
import {getGoogleMapsApiKey, GOOGLE_MAPS_LOADER_ID} from '../lib/maps/googleMaps'

type GoogleMapsContextValue = {
  apiKey: string
  isLoaded: boolean
  loadError: Error | undefined
  /** Call from map UIs so the Maps JS SDK only downloads when needed. */
  requestLoad: () => void
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  apiKey: '',
  isLoaded: false,
  loadError: undefined,
  requestLoad: () => {},
})

function GoogleMapsProviderInner({
  apiKey,
  requestLoad,
  children,
}: {
  apiKey: string
  requestLoad: () => void
  children: ReactNode
}) {
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

export function GoogleMapsProvider({children}: {children: ReactNode}) {
  const apiKey = getGoogleMapsApiKey()
  const [shouldLoad, setShouldLoad] = useState(false)
  const requestLoad = useCallback(() => setShouldLoad(true), [])

  if (!apiKey) {
    return (
      <GoogleMapsContext.Provider
        value={{apiKey: '', isLoaded: false, loadError: undefined, requestLoad}}
      >
        {children}
      </GoogleMapsContext.Provider>
    )
  }

  if (!shouldLoad) {
    return (
      <GoogleMapsContext.Provider
        value={{apiKey, isLoaded: false, loadError: undefined, requestLoad}}
      >
        {children}
      </GoogleMapsContext.Provider>
    )
  }

  return (
    <GoogleMapsProviderInner apiKey={apiKey} requestLoad={requestLoad}>
      {children}
    </GoogleMapsProviderInner>
  )
}

/** Hook for map components — triggers SDK load on first mount. */
export function useGoogleMapsLoader() {
  const ctx = useContext(GoogleMapsContext)
  const {requestLoad} = ctx
  useEffect(() => {
    requestLoad()
  }, [requestLoad])
  return ctx
}
