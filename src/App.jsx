import { useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from 'next-themes'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import CookiePreferences from './components/CookiePreferences/CookiePreferences'
import QuickContactFab from './components/QuickContactFab/QuickContactFab'
import SitePreloader from './components/SitePreloader/SitePreloader'
import CmsPreviewPicker from './components/CmsPreview/CmsPreviewPicker'
import AppRouter from './router/AppRouter'
import { MergedPropertiesProvider } from './hooks/useMergedProperties'
import { SiteContentProvider } from './hooks/useSiteContent'
import { GoogleMapsProvider } from './providers/GoogleMapsProvider'
import { isCmsPreviewMode } from './lib/content/cmsPreview'

function AppChrome({ cmsPreview }) {
  const {pathname} = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const hideOverlays = cmsPreview || isAdmin

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <AppRouter />
      </main>
      <Footer />
      {!hideOverlays ? <QuickContactFab /> : null}
      {/* Cookie bar steals CMS preview clicks and clutters the admin studio. */}
      {!hideOverlays ? <CookiePreferences /> : null}
      <CmsPreviewPicker />
    </>
  )
}

function App() {
  const cmsPreview = isCmsPreviewMode()
  const [showPreloader, setShowPreloader] = useState(() => {
    if (cmsPreview) return false
    try {
      return sessionStorage.getItem('up.preloaderSeen') !== '1'
    } catch {
      return true
    }
  })

  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="united-properties-theme">
        {showPreloader && (
          <SitePreloader
            onDone={() => {
              try {
                sessionStorage.setItem('up.preloaderSeen', '1')
              } catch {
                // ignore
              }
              setShowPreloader(false)
            }}
          />
        )}
        <BrowserRouter>
          <SiteContentProvider>
            <GoogleMapsProvider>
              <MergedPropertiesProvider>
                <AppChrome cmsPreview={cmsPreview} />
              </MergedPropertiesProvider>
            </GoogleMapsProvider>
          </SiteContentProvider>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App
