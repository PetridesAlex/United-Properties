import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero/Hero'
import OptimizedImage from '../components/OptimizedImage/OptimizedImage'
import CmsText from '../components/CmsPreview/CmsText'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { useSiteContent } from '../hooks/useSiteContent'
import './Home.css'

const FEATURED_COUNT = 6

const DEFAULT_SERVICES = [
  {
    key: 'invest',
    title: 'Invest with us',
    text: "Every investor has a different goal. Here's how we help you reach yours.",
    href: '/services#invest-with-us',
  },
  {
    key: 'sell',
    title: 'Sell with us',
    text: "Your property deserves more than a listing. Here's how we sell it.",
    href: '/services#sell-with-us',
  },
  {
    key: 'manage',
    title: 'Property management',
    text: 'Let your property work for you. Two plans. One standard of care.',
    href: '/services#property-management',
  },
]

function propertyCoverImage(property) {
  if (!property) return ''
  if (typeof property.image === 'string' && property.image.trim()) return property.image.trim()
  const gallery = Array.isArray(property.gallery) ? property.gallery : []
  const first = gallery.find((url) => typeof url === 'string' && url.trim())
  return first ? first.trim() : ''
}

function formatPrice(value, status) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  const formatted = new Intl.NumberFormat('en-US').format(n)
  return status === 'For Rent' ? `EUR ${formatted} / month` : `EUR ${formatted}`
}

function takeFeaturedMix(pool, maxCount) {
  const withCover = pool.filter((p) => propertyCoverImage(p) && p.slug)
  const rent = withCover.filter((p) => /rent/i.test(String(p.status || '')))
  const buy = withCover.filter((p) => /sale/i.test(String(p.status || '')))
  const mixed = []
  let r = 0
  let b = 0
  while (mixed.length < maxCount && (r < rent.length || b < buy.length)) {
    if (r < rent.length) mixed.push(rent[r++])
    if (mixed.length >= maxCount) break
    if (b < buy.length) mixed.push(buy[b++])
  }
  if (mixed.length >= maxCount) return mixed.slice(0, maxCount)

  const seen = new Set(mixed.map((p) => String(p.id)))
  const filler = withCover.filter((p) => !seen.has(String(p.id)))
  return [...mixed, ...filler].slice(0, maxCount)
}

function useNavbarOffset() {
  const [top, setTop] = useState(0)

  useEffect(() => {
    function measure() {
      const nav = document.querySelector('header.navbar')
      const next = nav ? Math.round(nav.getBoundingClientRect().height) : 0
      setTop((prev) => (prev === next ? prev : next))
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [])

  return top
}

function Home() {
  const { list: listingProperties } = useMergedProperties()
  const { get } = useSiteContent()
  const topOffset = useNavbarOffset()

  const featured = useMemo(
    () => takeFeaturedMix(listingProperties, FEATURED_COUNT),
    [listingProperties],
  )

  const featuredDescriptionRaw = get(
    'home',
    'featured',
    'description',
    'A selection from our current listings, to buy and to rent.',
  )
  const featuredDescription = /most exclusive houses|townhomes|penthouses/i.test(
    String(featuredDescriptionRaw || ''),
  )
    ? 'A selection from our current listings, to buy and to rent.'
    : featuredDescriptionRaw

  const servicesHeadingRaw = get(
    'home',
    'services',
    'heading',
    'Invest, sell, or let us manage your property.',
  )
  const servicesHeading = /comprehensive advisory|property services/i.test(
    String(servicesHeadingRaw || ''),
  )
    ? 'Invest, sell, or let us manage your property.'
    : servicesHeadingRaw

  const servicesEyebrowRaw = get('home', 'services', 'eyebrow', 'United Services')
  const servicesEyebrow = /^services$/i.test(String(servicesEyebrowRaw || '').trim())
    ? 'United Services'
    : servicesEyebrowRaw

  const services = DEFAULT_SERVICES.map((service, index) => {
    const n = index + 1
    const title = get('home', 'services', `card${n}_title`, service.title)
    const text = get('home', 'services', `card${n}_body`, service.text)
    const legacyTitle =
      /property sales|luxury rentals|luxury portfolio|investment advisory|holiday home|relocation|international client/i.test(
        String(title || ''),
      )
    return {
      ...service,
      title: legacyTitle ? service.title : title,
      text: legacyTitle
        ? service.text
        : /acquisition strategy|relocation and portfolio/i.test(String(text || ''))
          ? service.text
          : text,
    }
  })

  const ctaHeadingRaw = get('home', 'cta', 'heading', "Tell us what you're looking for.")
  const ctaHeading = /ready to find your ideal|ideal property in cyprus/i.test(
    String(ctaHeadingRaw || ''),
  )
    ? "Tell us what you're looking for."
    : ctaHeadingRaw

  const ctaDescRaw = get(
    'home',
    'cta',
    'description',
    'Buying, renting, selling or investing, it starts with a conversation.',
  )
  const ctaDescription = /tailored strategy|premium cyprus locations|connect with our advisors/i.test(
    String(ctaDescRaw || ''),
  )
    ? 'Buying, renting, selling or investing, it starts with a conversation.'
    : ctaDescRaw

  const ctaBtnRaw = get('home', 'cta', 'btn_quiz', 'Answer a few questions')
  const ctaBtn = /view listings|contact our team/i.test(String(ctaBtnRaw || ''))
    ? 'Answer a few questions'
    : ctaBtnRaw

  return (
    <>
      <Helmet>
        <title>
          {get('home', 'seo', 'title', 'United Properties | Luxury Real Estate in Cyprus')}
        </title>
        <meta
          name="description"
          content={get(
            'home',
            'seo',
            'description',
            'Curated homes, seafront living, and private-client advisory across Limassol and beyond.',
          )}
        />
      </Helmet>

      <div className="up-home" style={{ '--up-top': `${topOffset}px` }}>
        <Hero />

        <section
          className="hl"
          id="featured-properties"
          data-cms-page="home"
          data-cms-section="featured"
        >
          <div className="hl__inner">
            <CmsText page="home" section="featured" field="eyebrow" as="span" className="eb">
              {get('home', 'featured', 'eyebrow', 'Featured Properties')}
            </CmsText>
            <CmsText page="home" section="featured" field="heading" as="h2" className="tt">
              {get('home', 'featured', 'heading', 'Featured Properties')}
            </CmsText>
            <CmsText page="home" section="featured" field="description" as="p" className="tp">
              {featuredDescription}
            </CmsText>
            <div className="lv-rule" aria-hidden />

            <div className="fg">
              {featured.map((property) => (
                <Link
                  key={property.id}
                  className="fc2"
                  to={`/properties/${property.slug}`}
                  aria-label={`View listing: ${property.title}`}
                >
                  <OptimizedImage
                    src={propertyCoverImage(property)}
                    alt=""
                    preset="card"
                    sizes="(max-width: 760px) 94vw, (max-width: 1000px) 46vw, 32vw"
                  />
                  <div className="cap">
                    <div className="ct">{property.title}</div>
                    <div className="cp">{formatPrice(property.price, property.status)}</div>
                  </div>
                  <div className="plus" aria-hidden>
                    +
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="sd" data-cms-page="home" data-cms-section="services">
          <div className="sd__inner">
            <CmsText page="home" section="services" field="eyebrow" as="span" className="eb">
              {servicesEyebrow}
            </CmsText>
            <CmsText page="home" section="services" field="heading" as="h2" className="tt">
              {servicesHeading}
            </CmsText>
            <div className="lv-rule" aria-hidden />
            <div className="svg3">
              {services.map((service, index) => (
                <Link key={service.key} className="sv" to={service.href}>
                  <CmsText
                    page="home"
                    section="services"
                    field={`card${index + 1}_title`}
                    as="h3"
                  >
                    {service.title}
                  </CmsText>
                  <CmsText page="home" section="services" field={`card${index + 1}_body`} as="p">
                    {service.text}
                  </CmsText>
                  <span className="lm">
                    Learn more <span className="ar">&#8599;</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="hc" data-cms-page="home" data-cms-section="cta">
          <div className="cta">
            <CmsText page="home" section="cta" field="eyebrow" as="span" className="lbl">
              {get('home', 'cta', 'eyebrow', 'United Properties')}
            </CmsText>
            <CmsText page="home" section="cta" field="heading" as="h2" className="tt">
              {ctaHeading}
            </CmsText>
            <CmsText page="home" section="cta" field="description" as="p" className="tp">
              {ctaDescription}
            </CmsText>
            <div className="bt">
              <Link className="cb" to="/contact">
                <CmsText page="home" section="cta" field="btn_quiz" as="span">
                  {ctaBtn}
                </CmsText>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home
