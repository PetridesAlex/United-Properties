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
  const managementDeepLink = location.hash === '#property-management'
  const rentDeepLink = location.hash === '#rent-your-property'

  return (
    <>
      <Helmet>
        <title>Services | United Properties</title>
      </Helmet>

      <section
        className={`page-hero${investDeepLink || managementDeepLink || rentDeepLink ? ' page-hero--services-invest' : ''}`}
      >
        <div className="container">
          {investDeepLink ? (
            <div className="services-invest-hero">
              <p className="services-invest-hero__eyebrow">{get('services', 'invest', 'eyebrow')}</p>
              <h1 className="services-invest-hero__title">{get('services', 'invest', 'heading')}</h1>
              <p className="services-invest-hero__lead">{get('services', 'invest', 'description')}</p>
            </div>
          ) : managementDeepLink ? (
            <div className="services-invest-hero" id="property-management">
              <p className="services-invest-hero__eyebrow">{get('services', 'management', 'eyebrow')}</p>
              <h1 className="services-invest-hero__title">{get('services', 'management', 'heading')}</h1>
              <p className="services-invest-hero__lead">{get('services', 'management', 'description')}</p>
            </div>
          ) : rentDeepLink ? (
            <div className="services-invest-hero" id="rent-your-property">
              <p className="services-invest-hero__eyebrow">{get('services', 'rent_property', 'eyebrow')}</p>
              <h1 className="services-invest-hero__title">{get('services', 'rent_property', 'heading')}</h1>
              <p className="services-invest-hero__lead">{get('services', 'rent_property', 'description')}</p>
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

      {managementDeepLink ? (
        <section className="section section--light" id="property-management">
          <div className="container">
            <p>{get('services', 'management', 'body')}</p>
          </div>
        </section>
      ) : rentDeepLink ? (
        <section className="section section--light" id="rent-your-property">
          <div className="container">
            <p>{get('services', 'rent_property', 'body')}</p>
          </div>
        </section>
      ) : (
        <>
          <InvestWithUsSection />
          {!investDeepLink ? (
            <>
              <section className="section section--light" id="property-management">
                <div className="container">
                  <p className="section-eyebrow">{get('services', 'management', 'eyebrow')}</p>
                  <h2>{get('services', 'management', 'heading')}</h2>
                  <p>{get('services', 'management', 'description')}</p>
                  <p>{get('services', 'management', 'body')}</p>
                </div>
              </section>
              <section className="section section--alt" id="rent-your-property">
                <div className="container">
                  <p className="section-eyebrow">{get('services', 'rent_property', 'eyebrow')}</p>
                  <h2>{get('services', 'rent_property', 'heading')}</h2>
                  <p>{get('services', 'rent_property', 'description')}</p>
                  <p>{get('services', 'rent_property', 'body')}</p>
                </div>
              </section>
            </>
          ) : null}
        </>
      )}

      <CTASection title={get('services', 'cta', 'heading')} />
    </>
  )
}

export default Services
