import { Helmet } from 'react-helmet-async'
import CTASection from '../components/CTASection/CTASection'
import CmsText from '../components/CmsPreview/CmsText'
import { useSiteContent } from '../hooks/useSiteContent'

function Concierge() {
  const { get } = useSiteContent()

  return (
    <>
      <Helmet>
        <title>{get('concierge', 'hero', 'heading')} | United Properties</title>
      </Helmet>

      <section className="page-hero" data-cms-page="concierge" data-cms-section="hero">
        <div className="container">
          <CmsText page="concierge" section="hero" field="eyebrow" as="p">
            {get('concierge', 'hero', 'eyebrow')}
          </CmsText>
          <CmsText page="concierge" section="hero" field="heading" as="h1">
            {get('concierge', 'hero', 'heading')}
          </CmsText>
          <CmsText page="concierge" section="hero" field="description" as="p">
            {get('concierge', 'hero', 'description')}
          </CmsText>
        </div>
      </section>

      <section className="section section--light" data-cms-page="concierge" data-cms-section="story">
        <div className="container">
          <CmsText page="concierge" section="story" field="eyebrow" as="p" className="section-eyebrow">
            {get('concierge', 'story', 'eyebrow')}
          </CmsText>
          <CmsText page="concierge" section="story" field="heading" as="h2">
            {get('concierge', 'story', 'heading')}
          </CmsText>
          <CmsText page="concierge" section="story" field="body" as="p" className="section-lede">
            {get('concierge', 'story', 'body')}
          </CmsText>
        </div>
      </section>

      <section className="section section--alt" data-cms-page="concierge" data-cms-section="services">
        <div className="container grid-3">
          {[1, 2, 3].map((n) => (
            <article key={n} className="card-luxury" style={{padding: '1.25rem'}}>
              <CmsText page="concierge" section="services" field={`point${n}_title`} as="h3">
                {get('concierge', 'services', `point${n}_title`)}
              </CmsText>
              <CmsText page="concierge" section="services" field={`point${n}_body`} as="p">
                {get('concierge', 'services', `point${n}_body`)}
              </CmsText>
            </article>
          ))}
        </div>
      </section>

      <CTASection
        title={get('concierge', 'cta', 'heading')}
        description={get('concierge', 'cta', 'description')}
        primaryTo="/contact"
        primaryLabel={get('concierge', 'cta', 'button')}
        cmsPage="concierge"
        cmsSection="cta"
      />
    </>
  )
}

export default Concierge
