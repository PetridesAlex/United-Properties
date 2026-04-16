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
import AppRouter from './router/AppRouter'
import { MergedPropertiesProvider } from './hooks/useMergedProperties'

function App() {
  const [showPreloader, setShowPreloader] = useState(true)

  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="united-properties-theme">
        {showPreloader && <SitePreloader onDone={() => setShowPreloader(false)} />}
        <BrowserRouter>
          <MergedPropertiesProvider>
            <ScrollToTop />
            <Navbar />
            <main>
              <AppRouter />
            </main>
            <Footer />
            <QuickContactFab />
            <CookiePreferences />
          </MergedPropertiesProvider>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App
