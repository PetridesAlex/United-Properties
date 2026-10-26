import { Helmet } from 'react-helmet-async'
import InvestWithUsSection from '../components/InvestWithUsSection/InvestWithUsSection'
import SellWithUsSection from '../components/SellWithUsSection/SellWithUsSection'
import PropertyManagementSection from '../components/PropertyManagementSection/PropertyManagementSection'
import ServicesHeroSwitcher from '../components/ServicesHeroSwitcher/ServicesHeroSwitcher'
import CTASection from '../components/CTASection/CTASection'
import CmsText from '../components/CmsPreview/CmsText'
import CmsStaggeredHeading from '../components/StaggeredText/CmsStaggeredHeading'
import { useSiteContent } from '../hooks/useSiteContent'
import './Services.css'

function Services() {
  const { get } = useSiteContent()

  return (
    <>
      <Helmet>
        <title>{get('services', 'seo', 'title', 'United Services | United Properties')}</title>
        <meta
          name="description"
          content={get(
            'services',
            'seo',
            'description',
            'Invest, sell, and manage with United Properties — curated opportunities, fair sales, and hands-on property care.',
          )}
        />
      </Helmet>

      <section
        className="page-hero page-hero--services-invest"
        data-cms-page="services"
        data-cms-section="hero_switch"
      >
        <div className="container">
          <div className="services-invest-hero">
            <CmsText
              page="services"
              section="hero_switch"
              field="eyebrow"
              as="p"
              className="services-invest-hero__eyebrow"
            >
              {get('services', 'hero_switch', 'eyebrow', 'United Services')}
            </CmsText>
            <CmsStaggeredHeading
              page="services"
              section="hero_switch"
              field="heading"
              as="h1"
              className="services-invest-hero__title"
              text={get('services', 'hero_switch', 'heading', 'United Services')}
            />
            <CmsText
              page="services"
              section="hero_switch"
              field="lead"
              as="p"
              className="services-invest-hero__lead"
            >
              {get(
                'services',
                'hero_switch',
                'lead',
                'Three clear paths. One boutique standard of care.',
              )}
            </CmsText>
            <CmsText
              page="services"
              section="hero_switch"
              field="support"
              as="p"
              className="services-invest-hero__support"
            >
              {get(
                'services',
                'hero_switch',
                'support',
                'Invest, sell, or entrust us with management — each offering is built around honesty, local knowledge, and results that hold up.',
              )}
            </CmsText>

            <ServicesHeroSwitcher />
          </div>
        </div>
      </section>

      <InvestWithUsSection />

      <SellWithUsSection />

      <PropertyManagementSection />

      <CTASection title={get('services', 'cta', 'heading')} cmsPage="services" cmsSection="cta" />
    </>
  )
}

export default Services
