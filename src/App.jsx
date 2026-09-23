import { useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import CookiePreferences from './components/CookiePreferences/CookiePreferences'
import QuickContactFab from './components/QuickContactFab/QuickContactFab'
import SitePreloader from './components/SitePreloader/SitePreloader'
import CmsInlineEditor from './components/CmsPreview/InlineEditor'
import AppRouter from './router/AppRouter'
import { MergedPropertiesProvider } from './hooks/useMergedProperties'
import { SiteContentProvider } from './hooks/useSiteContent'
import { GoogleMapsProvider } from './providers/GoogleMapsProvider'
import { isCmsEditMode, isCmsPreviewMode } from './lib/content/cmsPreview'

function AppChrome({ cmsPreview }) {
  const {pathname} = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const hideOverlays = cmsPreview || isAdmin
  const showCookiesInEdit = cmsPreview && isCmsEditMode()

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <AppRouter />
      </main>
      <Footer />
      {!hideOverlays ? <QuickContactFab /> : null}
      {/* Cookie bar steals clicks on the live site; show it in CMS edit so its text can be edited. */}
      {!hideOverlays || showCookiesInEdit ? <CookiePreferences /> : null}
      <CmsInlineEditor />
      {cmsPreview ? <Toaster position="top-center" toastOptions={{duration: 2200}} /> : null}
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
