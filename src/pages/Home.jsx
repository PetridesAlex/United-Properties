import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
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
import { developments } from '../data/developments'
import { testimonials } from '../data/testimonials'
import { homeCenterFlowLinks } from '../data/homeCenterFlow'
import { useMergedProperties } from '../hooks/useMergedProperties'
import './Home.css'

const MotionDiv = motion.div

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
  const { list: mergedProperties } = useMergedProperties()
  const sanityOnly = useMemo(
    () => mergedProperties.filter((property) => property.source === 'sanity'),
    [mergedProperties],
  )
  const fallbackFeaturedProperties = useMemo(
    () => properties.filter((property) => property.featured).slice(0, 3),
    [],
  )
  const featuredProperties = useMemo(() => {
    if (!sanityOnly.length) return fallbackFeaturedProperties
    const featured = sanityOnly.filter((property) => property.featured)
    const source = featured.length ? featured : sanityOnly
    return source.slice(0, 3)
  }, [sanityOnly, fallbackFeaturedProperties])
  const featuredModalCards = useMemo(
    () =>
      featuredProperties.map((property) => ({
        id: String(property.id),
        imageUrl: property.image,
        title: property.title,
        description:
          property.description ||
          `Discover this ${property.type || 'property'} in ${property.location}.`,
        slug: property.slug,
      })),
    [featuredProperties],
  )
  const signatureCollectionProperties = useMemo(() => {
    const source = sanityOnly.length ? sanityOnly : properties
    const signatureOnly = source.filter(isSignatureProperty)

    // Keep the stack alive even before signature flags are set in CMS/data.
    if (signatureOnly.length) return signatureOnly

    const featuredFallback = source.filter((property) => property.featured)
    return featuredFallback.length ? featuredFallback : source
  }, [sanityOnly])
  const featuredAgents = agents.slice(0, 3)
  const homeServices = services.slice(0, 8)

  const centerFlowNodeItems = useMemo(
    () =>
      homeCenterFlowLinks.map((item) => ({
        content: (
          <Link
            className="home-center-flow__node-link"
            to={item.to}
            aria-label={`${item.title}: ${item.phrase}`}
          >
            <span className="home-center-flow__node-title">{item.title}</span>
            <span className="home-center-flow__node-phrase">{item.phrase}</span>
          </Link>
        ),
      })),
    [],
  )

  return (
    <>
      <Helmet>
        <title>United Properties | Luxury Real Estate in Cyprus</title>
      </Helmet>

      <Hero />

      <section
        className="section home-center-flow-section"
        aria-labelledby="home-network-heading"
      >
        <div className="home-center-flow-section__inner">
          <SectionHeader
            center
            headingId="home-network-heading"
            eyebrow="United Properties"
            title="Connected expertise across every property service"
            description="From acquisition and sales to rentals, new developments, and property management—one team linking you to Cyprus’s luxury market with clarity and continuity."
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
            eyebrow="Featured Properties"
            title="Featured Properties"
            description="Check out some of our most exclusive houses, apartments, townhomes, penthouses, and more."
            className="section-header--featured"
          />
          <ModalCards cards={featuredModalCards} className="home-featured-modal-cards" />
        </div>
      </section>

      <section className="section section--alt home-scroll-stack-section">
        <div className="container">
          <SectionHeader
            eyebrow="Signature Collection"
            title="Scroll Through Our Most Exclusive Addresses"
            description="A cinematic stacked showcase powered by smooth motion interactions and premium storytelling."
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
            {signatureCollectionProperties.map((property) => (
              <ScrollStackItem key={`stack-${property.id}`} itemClassName="home-scroll-stack-card">
                <img src={property.image} alt={property.title} />
                <div className="home-scroll-stack-card__overlay" />
                <div className="home-scroll-stack-card__content">
                  <p>{property.location}</p>
                  <h3>{property.title}</h3>
                  <span>EUR {property.price.toLocaleString()}</span>
                  <Link to={`/properties/${property.slug}`} className="btn btn-outline-light">
                    View Property
                  </Link>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <SectionHeader
            eyebrow="New Developments"
            title="Off-Plan and Next-Generation Residences"
            description="Position early in standout projects designed for lifestyle prestige and future capital growth."
          />
          <div className="home-dev-grid">
            {developments.map((development) => (
              <article key={development.id} className="home-dev-card">
                <img src={development.image} alt={development.name} />
                <div>
                  <p className="home-dev-card__status">{development.status}</p>
                  <h3>{development.name}</h3>
                  <p>{development.area}</p>
                  <p>{development.description}</p>
                  <Link to="/developments" className="btn btn-outline-light">
                    Inquire
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeader
            eyebrow="Services"
            title="Comprehensive Advisory and Property Services"
            description="From acquisition strategy to relocation and portfolio management, every step is tailored."
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
            <p className="home-editorial__eyebrow">Editorial Perspective</p>
            <h2>Coastal Living, Strategic Value, and Tailored Guidance</h2>
            <p>
              Cyprus offers a rare combination of Mediterranean lifestyle, long-term
              growth fundamentals, and global buyer accessibility. Our advisors blend
              market intelligence with private-client service to secure properties that
              align with your ambitions.
            </p>
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
            eyebrow="Advisory Team"
            title="Experienced Professionals"
            description="Specialist consultants in prime residential, development, and cross-border transactions."
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
            eyebrow="Client Testimonials"
            title="Trusted by Local and International Clients"
            className="home-testimonials__header"
          />
          <div className="grid-3 home-testimonials__grid">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}

export default Home
