import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import CookiePreferences from './components/CookiePreferences/CookiePreferences'
import AppRouter from './router/AppRouter'
import { MergedPropertiesProvider } from './hooks/useMergedProperties'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <MergedPropertiesProvider>
          <ScrollToTop />
          <Navbar />
          <main>
            <AppRouter />
          </main>
          <Footer />
          <CookiePreferences />
        </MergedPropertiesProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
