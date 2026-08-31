import { Helmet } from 'react-helmet-async'
import { Navigate, useLocation } from 'react-router-dom'
import InvestWithUsSection from '../components/InvestWithUsSection/InvestWithUsSection'
import CTASection from '../components/CTASection/CTASection'
import { useSiteContent } from '../hooks/useSiteContent'
import './Services.css'

function Services() {
  const location = useLocation()
  const { get } = useSiteContent()

  if (location.pathname === '/services' && location.hash === '#sell-with-us') {
    return <Navigate to="/sell-with-us" replace />
  }

  const investDeepLink = location.hash === '#invest-with-us'

  return (
    <>
      <Helmet>
        <title>Services | United Properties</title>
      </Helmet>

      <section className={`page-hero${investDeepLink ? ' page-hero--services-invest' : ''}`}>
        <div className="container">
          {investDeepLink ? (
            <div className="services-invest-hero">
              <p className="services-invest-hero__eyebrow">{get('services', 'invest', 'eyebrow')}</p>
              <h1 className="services-invest-hero__title">{get('services', 'invest', 'heading')}</h1>
              <p className="services-invest-hero__lead">{get('services', 'invest', 'description')}</p>
            </div>
          ) : (
            <>
              <p>{get('services', 'hero', 'eyebrow')}</p>
              <h1>{get('services', 'hero', 'heading')}</h1>
              <p>{get('services', 'hero', 'description')}</p>
            </>
          )}
        </div>
      </section>

      <InvestWithUsSection />

      <CTASection title={get('services', 'cta', 'heading')} />
    </>
  )
}

export default Services
