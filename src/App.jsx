import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
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
import { GoogleMapsProvider } from './providers/GoogleMapsProvider'
import { isCmsPreviewMode } from './lib/content/cmsPreview'

function App() {
  const cmsPreview = isCmsPreviewMode()
  const [showPreloader, setShowPreloader] = useState(!cmsPreview)

  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="united-properties-theme">
        {showPreloader && <SitePreloader onDone={() => setShowPreloader(false)} />}
        <BrowserRouter>
          <GoogleMapsProvider>
            <MergedPropertiesProvider>
              <ScrollToTop />
              <Navbar />
              <main>
                <AppRouter />
              </main>
              <Footer />
              {!cmsPreview ? <QuickContactFab /> : null}
              <CookiePreferences />
              <CmsPreviewPicker />
            </MergedPropertiesProvider>
          </GoogleMapsProvider>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App
