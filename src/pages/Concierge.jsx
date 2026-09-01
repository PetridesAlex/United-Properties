import { Helmet } from 'react-helmet-async'
import CTASection from '../components/CTASection/CTASection'
import { useSiteContent } from '../hooks/useSiteContent'

function Concierge() {
  const { get } = useSiteContent()

  return (
    <>
      <Helmet>
        <title>{get('concierge', 'hero', 'heading')} | United Properties</title>
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <p>{get('concierge', 'hero', 'eyebrow')}</p>
          <h1>{get('concierge', 'hero', 'heading')}</h1>
          <p>{get('concierge', 'hero', 'description')}</p>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <p className="section-eyebrow">{get('concierge', 'story', 'eyebrow')}</p>
          <h2>{get('concierge', 'story', 'heading')}</h2>
          <p className="section-lede">{get('concierge', 'story', 'body')}</p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container grid-3">
          {[1, 2, 3].map((n) => (
            <article key={n} className="card-luxury" style={{ padding: '1.25rem' }}>
              <h3>{get('concierge', 'services', `point${n}_title`)}</h3>
              <p>{get('concierge', 'services', `point${n}_body`)}</p>
            </article>
          ))}
        </div>
      </section>

      <CTASection
        title={get('concierge', 'cta', 'heading')}
        description={get('concierge', 'cta', 'description')}
        primaryTo="/contact"
        primaryLabel={get('concierge', 'cta', 'button')}
      />
    </>
  )
}

export default Concierge
