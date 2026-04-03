import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero/Hero'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import RegionCard from '../components/RegionCard/RegionCard'
import ServiceCard from '../components/ServiceCard/ServiceCard'
import AgentCard from '../components/AgentCard/AgentCard'
import TestimonialCard from '../components/TestimonialCard/TestimonialCard'
import CTASection from '../components/CTASection/CTASection'
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack/ScrollStack'
import { properties } from '../data/properties'
import { regions } from '../data/regions'
import { services } from '../data/services'
import { agents } from '../data/agents'
import { developments } from '../data/developments'
import { testimonials } from '../data/testimonials'
import { useMergedProperties } from '../hooks/useMergedProperties'
import './Home.css'

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

  return (
    <>
      <Helmet>
        <title>United Properties | Luxury Real Estate in Cyprus</title>
      </Helmet>

      <Hero />

      <section className="section section--alt home-after-hero-shape">
        <div className="container">
          <SectionHeader
            eyebrow="OUR LOCATION"
            title="Prime Cyprus Regions"
            description="Discover the home you’ve been waiting for."
          />
          <div className="grid-3 home-region-grid">
            {regions.map((region) => (
              <RegionCard key={region.name} region={region} />
            ))}
          </div>
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
          <div className="grid-3 home-featured-grid">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="signature"
                showDescription={false}
                showButton={false}
              />
            ))}
          </div>
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
          <motion.div
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
          </motion.div>
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
