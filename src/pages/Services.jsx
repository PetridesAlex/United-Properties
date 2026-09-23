import { Helmet } from 'react-helmet-async'
import { Navigate, useLocation } from 'react-router-dom'
import InvestWithUsSection from '../components/InvestWithUsSection/InvestWithUsSection'
import CTASection from '../components/CTASection/CTASection'
import CmsText from '../components/CmsPreview/CmsText'
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
        <title>{get('services', 'seo', 'title', 'Services | United Properties')}</title>
        <meta
          name="description"
          content={get(
            'services',
            'seo',
            'description',
            'Premium real estate services in Cyprus — sales, rentals, investment, and management.',
          )}
        />
      </Helmet>

      <section
        className={`page-hero${investDeepLink || managementDeepLink || rentDeepLink ? ' page-hero--services-invest' : ''}`}
        data-cms-page="services"
        data-cms-section="hero"
      >
        <div className="container">
          {investDeepLink ? (
            <div className="services-invest-hero" data-cms-page="services" data-cms-section="invest">
              <CmsText page="services" section="invest" field="eyebrow" as="p" className="services-invest-hero__eyebrow">
                {get('services', 'invest', 'eyebrow')}
              </CmsText>
              <CmsText page="services" section="invest" field="heading" as="h1" className="services-invest-hero__title">
                {get('services', 'invest', 'heading')}
              </CmsText>
              <CmsText page="services" section="invest" field="description" as="p" className="services-invest-hero__lead">
                {get('services', 'invest', 'description')}
              </CmsText>
            </div>
          ) : managementDeepLink ? (
            <div className="services-invest-hero" id="property-management" data-cms-page="services" data-cms-section="management">
              <CmsText page="services" section="management" field="eyebrow" as="p" className="services-invest-hero__eyebrow">
                {get('services', 'management', 'eyebrow')}
              </CmsText>
              <CmsText page="services" section="management" field="heading" as="h1" className="services-invest-hero__title">
                {get('services', 'management', 'heading')}
              </CmsText>
              <CmsText page="services" section="management" field="description" as="p" className="services-invest-hero__lead">
                {get('services', 'management', 'description')}
              </CmsText>
            </div>
          ) : rentDeepLink ? (
            <div className="services-invest-hero" id="rent-your-property" data-cms-page="services" data-cms-section="rent_property">
              <CmsText page="services" section="rent_property" field="eyebrow" as="p" className="services-invest-hero__eyebrow">
                {get('services', 'rent_property', 'eyebrow')}
              </CmsText>
              <CmsText page="services" section="rent_property" field="heading" as="h1" className="services-invest-hero__title">
                {get('services', 'rent_property', 'heading')}
              </CmsText>
              <CmsText page="services" section="rent_property" field="description" as="p" className="services-invest-hero__lead">
                {get('services', 'rent_property', 'description')}
              </CmsText>
            </div>
          ) : (
            <>
              <CmsText page="services" section="hero" field="eyebrow" as="p">
                {get('services', 'hero', 'eyebrow')}
              </CmsText>
              <CmsText page="services" section="hero" field="heading" as="h1">
                {get('services', 'hero', 'heading')}
              </CmsText>
              <CmsText page="services" section="hero" field="description" as="p">
                {get('services', 'hero', 'description')}
              </CmsText>
            </>
          )}
        </div>
      </section>

      {managementDeepLink ? (
        <section
          className="section section--light"
          id="property-management"
          data-cms-page="services"
          data-cms-section="management"
        >
          <div className="container">
            <CmsText page="services" section="management" field="body" as="p">
              {get('services', 'management', 'body')}
            </CmsText>
          </div>
        </section>
      ) : rentDeepLink ? (
        <section
          className="section section--light"
          id="rent-your-property"
          data-cms-page="services"
          data-cms-section="rent_property"
        >
          <div className="container">
            <CmsText page="services" section="rent_property" field="body" as="p">
              {get('services', 'rent_property', 'body')}
            </CmsText>
          </div>
        </section>
      ) : (
        <>
          <InvestWithUsSection />
          {!investDeepLink ? (
            <>
              <section
                className="section section--light"
                id="property-management"
                data-cms-page="services"
                data-cms-section="management"
              >
                <div className="container">
                  <CmsText page="services" section="management" field="eyebrow" as="p" className="section-eyebrow">
                    {get('services', 'management', 'eyebrow')}
                  </CmsText>
                  <CmsText page="services" section="management" field="heading" as="h2">
                    {get('services', 'management', 'heading')}
                  </CmsText>
                  <CmsText page="services" section="management" field="description" as="p">
                    {get('services', 'management', 'description')}
                  </CmsText>
                  <CmsText page="services" section="management" field="body" as="p">
                    {get('services', 'management', 'body')}
                  </CmsText>
                </div>
              </section>
              <section
                className="section section--alt"
                id="rent-your-property"
                data-cms-page="services"
                data-cms-section="rent_property"
              >
                <div className="container">
                  <CmsText page="services" section="rent_property" field="eyebrow" as="p" className="section-eyebrow">
                    {get('services', 'rent_property', 'eyebrow')}
                  </CmsText>
                  <CmsText page="services" section="rent_property" field="heading" as="h2">
                    {get('services', 'rent_property', 'heading')}
                  </CmsText>
                  <CmsText page="services" section="rent_property" field="description" as="p">
                    {get('services', 'rent_property', 'description')}
                  </CmsText>
                  <CmsText page="services" section="rent_property" field="body" as="p">
                    {get('services', 'rent_property', 'body')}
                  </CmsText>
                </div>
              </section>
            </>
          ) : null}
        </>
      )}

      <CTASection title={get('services', 'cta', 'heading')} cmsPage="services" cmsSection="cta" />
    </>
  )
}

export default Services
