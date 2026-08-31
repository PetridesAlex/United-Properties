import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero/Hero'
import CenterFlow from '../components/CenterFlow/CenterFlow'
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
import { homeCenterFlowLinks } from '../data/homeCenterFlow'
import { useMergedProperties } from '../hooks/useMergedProperties'
import { useSiteContent } from '../hooks/useSiteContent'
import './Home.css'

const MotionDiv = motion.div
const HOME_SCROLL_STACK_PREVIEW_COUNT = 6
/** Featured ModalCards: max cards; prefer featured flag, then fill from pool for layout preview */
const FEATURED_MODAL_PREVIEW_COUNT = 12

/** Cinematic “render-style” hero art (preview / marketing — not tied to listing photos). */
const SIGNATURE_SCROLL_STACK_IMAGES = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1600047509807-ba61f281090b?auto=format&fit=crop&w=1920&q=85',
]

const FEATURED_MODAL_CINEMATIC_IMAGES = [
  ...SIGNATURE_SCROLL_STACK_IMAGES,
  'https://images.unsplash.com/photo-1600585154087-4e5fe7c90381?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1600566753089-00f18fb6b442?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1600573472592-401b3a6e6939?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1613490493578-7fde639acd22?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1600047509358-9dc87607ebfa?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1920&q=85',
]

function takeFeaturedWithFill(pool, maxCount) {
  const featured = pool.filter((p) => p.featured)
  if (featured.length >= maxCount) return featured.slice(0, maxCount)
  const seen = new Set(featured.map((p) => String(p.id)))
  const filler = pool.filter((p) => !seen.has(String(p.id)))
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
      featuredProperties.map((property, index) => ({
        id: String(property.id),
        imageUrl:
          FEATURED_MODAL_CINEMATIC_IMAGES[index % FEATURED_MODAL_CINEMATIC_IMAGES.length],
        title: property.title,
        description:
          property.description ||
          `Discover this ${property.type || 'property'} in ${property.location}.`,
        slug: property.slug,
      })),
    [featuredProperties],
  )
  const signatureCollectionProperties = useMemo(() => {
    const source = listingProperties.length ? listingProperties : properties
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
      signatureCollectionProperties.map((property, index) => ({
        ...property,
        scrollStackCoverImage:
          SIGNATURE_SCROLL_STACK_IMAGES[index % SIGNATURE_SCROLL_STACK_IMAGES.length],
      })),
    [signatureCollectionProperties],
  )

  const featuredAgents = agents.slice(0, 3)
  const homeServices = services.slice(0, 8)

  const centerFlowNodeItems = useMemo(
    () =>
      homeCenterFlowLinks.map((item, index) => {
        const n = index + 1
        const title = get('home', 'network', `node${n}_title`, item.title)
        const phrase = get('home', 'network', `node${n}_phrase`, item.phrase)
        return {
          content: (
            <Link
              className="home-center-flow__node-link home-center-flow__node-link--rent"
              to={item.to}
              aria-label={`${title}: ${phrase}`}
            >
              <span className="home-center-flow__node-title">{title}</span>
              <span className="home-center-flow__node-phrase">{phrase}</span>
            </Link>
          ),
        }
      }),
    [get],
  )

  const signatureViewCta = get('home', 'signature', 'view_cta', 'View Property')

  useEffect(() => {
    document.title = 'United Properties | Luxury Real Estate in Cyprus'
  }, [])

  return (
    <>
      <Hero />

      <section
        className="section home-center-flow-section"
        aria-labelledby="home-network-heading"
      >
        <div className="home-center-flow-section__inner">
          <SectionHeader
            center
            headingId="home-network-heading"
            eyebrow={get('home', 'network', 'eyebrow')}
            title={get('home', 'network', 'heading')}
            description={get('home', 'network', 'description')}
            className="section-header--center-flow"
          />
          <CenterFlow
            className="home-center-flow-container"
            surface="dark"
            subtleGlow
            pulseStrength={0.42}
            centerClassName="home-center-flow__center-hub"
            nodeItems={centerFlowNodeItems}
            centerSize={176}
            centerBackground="linear-gradient(165deg, #1a2233 0%, #1f2a3d 48%, #263247 100%)"
            nodeSize={114}
            nodeDistance={0.72}
            pulseDuration={5}
            pulseInterval={8}
            pulseLength={0.42}
            lineWidth={1.9}
            pulseWidth={1.35}
            pulseSoftness={8}
            lineColor="rgba(255, 255, 255, 0.22)"
            pulseColor="#a898b8"
            pulseColorLight="#a898b8"
            glowColor="#c5a46d"
            glowColorLight="#c5a46d"
            maxGlowIntensity={14}
            glowDecay={0.94}
            borderRadius={38}
            disableBlinking={false}
            centerContent={
              <img
                className="home-center-flow__logo"
                src="/images/logo/United_Properties_v2.1.svg"
                alt="United Properties"
                loading="eager"
                decoding="async"
              />
            }
          />
        </div>
      </section>

      <section className="section section--light" id="featured-properties">
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

      <section className="section section--alt home-scroll-stack-section">
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

      <section className="section section--light">
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

      <section className="section section--alt">
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

      <section className="section section--light">
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

      <section className="section section--alt home-testimonials">
        <div className="container home-testimonials__container">
          <SectionHeader
            eyebrow={get('home', 'testimonials', 'eyebrow')}
            title={get('home', 'testimonials', 'heading')}
            className="home-testimonials__header"
          />
          <div className="grid-3 home-testimonials__grid">
            {testimonials.map((testimonial) => (
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
