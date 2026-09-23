import {lazy, Suspense} from 'react'
import {Navigate, Route, Routes, useParams} from 'react-router-dom'
import Home from '../pages/Home'

const Search = lazy(() => import('../pages/Search'))
const Properties = lazy(() => import('../pages/Properties'))
const PropertyDetails = lazy(() => import('../pages/PropertyDetails'))
const About = lazy(() => import('../pages/About'))
const Services = lazy(() => import('../pages/Services'))
const SellWithUs = lazy(() => import('../pages/SellWithUs'))
const Concierge = lazy(() => import('../pages/Concierge'))
const Agents = lazy(() => import('../pages/Agents'))
const Contact = lazy(() => import('../pages/Contact'))
const HeroVideoWatch = lazy(() => import('../pages/HeroVideoWatch'))
const NotFound = lazy(() => import('../pages/NotFound'))
const AdminRoutes = lazy(() => import('../pages/admin/AdminRoutes'))

function LegacyPropertyRedirect() {
  const {slug} = useParams()
  return <Navigate to={`/properties/${slug}`} replace />
}

function RouteFallback() {
  return <div className="route-fallback" aria-hidden="true" />
}

function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/new-developments" element={<Navigate to="/properties" replace />} />
        <Route path="/developments" element={<Navigate to="/properties" replace />} />
        <Route path="/buy" element={<Properties />} />
        <Route path="/rent" element={<Properties />} />
        <Route path="/sold" element={<Properties />} />
        <Route path="/rented" element={<Properties />} />
        <Route path="/featured-properties" element={<Properties />} />
        <Route path="/signature-listings" element={<Properties />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/limassol" element={<Properties />} />
        <Route path="/properties/paphos" element={<Navigate to="/buy" replace />} />
        <Route path="/properties/nicosia" element={<Navigate to="/buy" replace />} />
        <Route path="/properties/larnaca" element={<Navigate to="/buy" replace />} />
        <Route path="/properties/protaras" element={<Navigate to="/buy" replace />} />
        <Route path="/properties/ayia-napa" element={<Navigate to="/buy" replace />} />
        <Route path="/property/:slug" element={<LegacyPropertyRedirect />} />
        <Route path="/properties/:slug" element={<PropertyDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/sell-with-us" element={<SellWithUs />} />
        <Route path="/concierge" element={<Concierge />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/videos/luxury-real-estate-cyprus" element={<HeroVideoWatch />} />
        <Route
          path="/video/hero-video"
          element={<Navigate to="/videos/luxury-real-estate-cyprus" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
