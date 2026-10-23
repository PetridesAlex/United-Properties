import {createContext} from 'react'

export type GoogleMapsContextValue = {
  apiKey: string
  isLoaded: boolean
  loadError: Error | undefined
  /** Call from map UIs so the Maps JS SDK only downloads when needed. */
  requestLoad: () => void
}

export const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  apiKey: '',
  isLoaded: false,
  loadError: undefined,
  requestLoad: () => {},
})
