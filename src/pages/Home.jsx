import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero/Hero'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import ModalCards from '../components/ModalCards/ModalCards'
import ServiceCard from '../components/ServiceCard/ServiceCard'
import AgentCard from '../components/AgentCard/AgentCard'
import TestimonialCard from '../components/TestimonialCard/TestimonialCard'
import CTASection from '../components/CTASection/CTASection'
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack/ScrollStack'
import { properties } from '../data/properties'
import { services } from '../data/services'
import { agents } from '../data/agents'
import { testimonials } from '../data/testimonials'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { useSiteContent } from '../hooks/useSiteContent'
import './Home.css'

const MotionDiv = motion.div
const HOME_SCROLL_STACK_PREVIEW_COUNT = 6
/** Featured ModalCards: max cards; prefer featured flag, then fill from pool for layout preview */
const FEATURED_MODAL_PREVIEW_COUNT = 12

/** Cover photo from CMS (gallery #1 / is_featured) — never stock placeholders. */
function propertyCoverImage(property) {
  if (!property) return ''
  if (typeof property.image === 'string' && property.image.trim()) return property.image.trim()
  const gallery = Array.isArray(property.gallery) ? property.gallery : []
  const first = gallery.find((url) => typeof url === 'string' && url.trim())
  return first ? first.trim() : ''
}

function takeFeaturedWithFill(pool, maxCount) {
  const withCover = pool.filter((p) => propertyCoverImage(p))
  const featured = withCover.filter((p) => p.featured)
  if (featured.length >= maxCount) return featured.slice(0, maxCount)
  const seen = new Set(featured.map((p) => String(p.id)))
  const filler = withCover.filter((p) => !seen.has(String(p.id)))
  return [...featured, ...filler].slice(0, maxCount)
}

function isSignatureProperty(property) {
  if (!property) return false
  if (property.isSignature === true) return true

  const category = typeof property.category === 'string' ? property.category.toLowerCase() : ''
  const tags = Array.isArray(property.badges) ? property.badges.map((tag) => String(tag).toLowerCase()) : []
  const type = typeof property.type === 'string' ? property.type.toLowerCase() : ''

  return (
    category.includes('signature') ||
    tags.some((tag) => tag.includes('signature')) ||
    type.includes('signature')
  )
}

function Home() {
  const { list: listingProperties } = useMergedProperties()
  const { get } = useSiteContent()
  const featuredProperties = useMemo(
    () => takeFeaturedWithFill(listingProperties, FEATURED_MODAL_PREVIEW_COUNT),
    [listingProperties],
  )
  const featuredModalCards = useMemo(
    () =>
      featuredProperties.map((property) => ({
        id: String(property.id),
        imageUrl: propertyCoverImage(property),
        title: property.title,
        description:
          property.description ||
          `Discover this ${property.type || 'property'} in ${property.location}.`,
        slug: property.slug,
      })),
    [featuredProperties],
  )
  const signatureCollectionProperties = useMemo(() => {
    const source = (listingProperties.length ? listingProperties : properties).filter(
      (property) => propertyCoverImage(property),
    )
    const signatureOnly = source.filter(isSignatureProperty)

    // Keep stack rich in preview mode: prefer signature, then featured, then fill from remaining.
    if (signatureOnly.length >= HOME_SCROLL_STACK_PREVIEW_COUNT) {
      return signatureOnly.slice(0, HOME_SCROLL_STACK_PREVIEW_COUNT)
    }

    const featuredFallback = source.filter((property) => property.featured)
    const prioritized = signatureOnly.length ? signatureOnly : featuredFallback
    const remainder = source.filter(
      (property) => !prioritized.some((candidate) => candidate.id === property.id),
    )

    return [...prioritized, ...remainder].slice(0, HOME_SCROLL_STACK_PREVIEW_COUNT)
  }, [listingProperties])

  const signatureScrollStackItems = useMemo(
    () =>
      signatureCollectionProperties.map((property) => ({
        ...property,
        scrollStackCoverImage: propertyCoverImage(property),
      })),
    [signatureCollectionProperties],
  )

  const featuredAgents = agents.slice(0, 3)
  const homeServices = services.slice(0, 8).map((service, index) => ({
    ...service,
    title: get('home', 'services', `card${index + 1}_title`, service.title),
    description: get('home', 'services', `card${index + 1}_body`, service.description),
  }))
  const homeTestimonials = [1, 2, 3].map((n, index) => {
    const fallback = testimonials[index]
    return {
      id: n,
      name: get('home', 'testimonials', `name${n}`, fallback?.name || ''),
      location: get('home', 'testimonials', `location${n}`, fallback?.location || ''),
      avatarUrl: fallback?.avatarUrl || '',
      quote: get('home', 'testimonials', `quote${n}`, fallback?.quote || ''),
    }
  })

  const signatureViewCta = get('home', 'signature', 'view_cta', 'View Property')

  useEffect(() => {
    document.title = 'United Properties | Luxury Real Estate in Cyprus'
  }, [])

  return (
    <>
      <Hero />

      <section
        className="section section--light"
        id="featured-properties"
        data-cms-page="home"
        data-cms-section="featured"
      >
        <div className="container home-featured-container">
          <SectionHeader
            eyebrow={get('home', 'featured', 'eyebrow')}
            title={get('home', 'featured', 'heading')}
            description={get('home', 'featured', 'description')}
            className="section-header--featured"
          />
          <ModalCards cards={featuredModalCards} className="home-featured-modal-cards" />
        </div>
      </section>

      <section
        className="section section--alt home-scroll-stack-section"
        data-cms-page="home"
        data-cms-section="signature"
      >
        <div className="container">
          <SectionHeader
            eyebrow={get('home', 'signature', 'eyebrow')}
            title={get('home', 'signature', 'heading')}
            description={get('home', 'signature', 'description')}
          />
          <ScrollStack
            className="home-scroll-stack"
            useWindowScroll
            itemDistance={90}
            itemScale={0.05}
            itemStackDistance={26}
            stackPosition="22%"
            scaleEndPosition="12%"
            baseScale={0.82}
            rotationAmount={0}
          >
            {signatureScrollStackItems.map((property) => (
              <ScrollStackItem key={`stack-${property.id}`} itemClassName="home-scroll-stack-card">
                <img
                  src={property.scrollStackCoverImage}
                  alt={property.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="home-scroll-stack-card__overlay" />
                <div className="home-scroll-stack-card__content">
                  <p>{property.location}</p>
                  <h3>{property.title}</h3>
                  <span>EUR {property.price.toLocaleString()}</span>
                  <Link to={`/properties/${property.slug}`} className="btn btn-outline-light">
                    {signatureViewCta}
                  </Link>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </section>

      <section className="section section--light" data-cms-page="home" data-cms-section="services">
        <div className="container">
          <SectionHeader
            eyebrow={get('home', 'services', 'eyebrow')}
            title={get('home', 'services', 'heading')}
            description={get('home', 'services', 'description')}
          />
          <div className="grid-4">
            {homeServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt" data-cms-page="home" data-cms-section="editorial">
        <div className="container home-editorial">
          <MotionDiv
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <p className="home-editorial__eyebrow">{get('home', 'editorial', 'eyebrow')}</p>
            <h2>{get('home', 'editorial', 'heading')}</h2>
            <p>{get('home', 'editorial', 'body')}</p>
          </MotionDiv>
          <img
            src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80"
            alt="Luxury Cyprus property lifestyle"
          />
        </div>
      </section>

      <section className="section section--light" data-cms-page="home" data-cms-section="team">
        <div className="container">
          <SectionHeader
            eyebrow={get('home', 'team', 'eyebrow')}
            title={get('home', 'team', 'heading')}
            description={get('home', 'team', 'description')}
          />
          <div className="grid-3">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="section section--alt home-testimonials"
        data-cms-page="home"
        data-cms-section="testimonials"
      >
        <div className="container home-testimonials__container">
          <SectionHeader
            eyebrow={get('home', 'testimonials', 'eyebrow')}
            title={get('home', 'testimonials', 'heading')}
            className="home-testimonials__header"
          />
          <div className="grid-3 home-testimonials__grid">
            {homeTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title={get('home', 'cta', 'heading')}
        description={get('home', 'cta', 'description')}
      />
    </>
  )
}

export default Home
