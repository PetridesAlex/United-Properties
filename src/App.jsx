import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import CookiePreferences from './components/CookiePreferences/CookiePreferences'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <main>
          <AppRouter />
        </main>
        <Footer />
        <CookiePreferences />
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
