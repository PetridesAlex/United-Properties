import {lazy, Suspense, useCallback, useContext, useEffect, useState, type ReactNode} from 'react'
import {getGoogleMapsApiKey} from '../lib/maps/googleMaps'
import {GoogleMapsContext, type GoogleMapsContextValue} from './googleMapsContext'

const GoogleMapsLoader = lazy(() => import('./GoogleMapsLoader'))

export function GoogleMapsProvider({children}: {children: ReactNode}) {
  const apiKey = getGoogleMapsApiKey()
  const [shouldLoad, setShouldLoad] = useState(false)
  const requestLoad = useCallback(() => setShouldLoad(true), [])

  const idle: GoogleMapsContextValue = {
    apiKey,
    isLoaded: false,
    loadError: undefined,
    requestLoad,
  }

  if (!apiKey || !shouldLoad) {
    return <GoogleMapsContext.Provider value={idle}>{children}</GoogleMapsContext.Provider>
  }

  return (
    <Suspense fallback={<GoogleMapsContext.Provider value={idle}>{children}</GoogleMapsContext.Provider>}>
      <GoogleMapsLoader apiKey={apiKey} requestLoad={requestLoad}>
        {children}
      </GoogleMapsLoader>
    </Suspense>
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
