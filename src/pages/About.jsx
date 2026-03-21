import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import AgentCard from '../components/AgentCard/AgentCard'
import CTASection from '../components/CTASection/CTASection'
import { agents } from '../data/agents'
import './About.css'

function About() {
  return (
    <>
      <Helmet>
        <title>About Us | UNITED PROPERTIES</title>
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <p>About UNITED PROPERTIES</p>
          <h1>Trusted Cyprus Real Estate Advisory</h1>
          <p>
            We combine local expertise, international perspective, and private-client
            service to deliver clear property decisions.
          </p>
        </div>
      </section>

      <section className="section section--light">
        <div className="container about-grid">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1500&q=80"
            alt="UNITED PROPERTIES office lounge"
          />
          <div>
            <SectionHeader eyebrow="Brand Story" title="Precision, Trust, and Market Insight" />
            <p>
              Our firm was built to elevate how clients navigate Cyprus property. Every
              recommendation is grounded in market data, location dynamics, and personal
              objectives.
            </p>
            <h3>Mission</h3>
            <p>Deliver premium real estate outcomes through tailored advisory and execution excellence.</p>
            <h3>Values</h3>
            <p>Integrity, discretion, strategic clarity, and long-term relationships.</p>
            <Link to="/contact" className="btn btn-outline-dark">
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeader
            title="Why Choose Us"
            description="Local market mastery, international buyer support, and premium transaction guidance."
          />
          <div className="grid-3">
            <article className="card-luxury about-point">
              <h3>Prime Market Access</h3>
              <p>Curated inventory in Cyprus locations with strong lifestyle and value fundamentals.</p>
            </article>
            <article className="card-luxury about-point">
              <h3>Global Buyer Expertise</h3>
              <p>Structured support for overseas investors, expats, and relocation clients.</p>
            </article>
            <article className="card-luxury about-point">
              <h3>End-to-End Advisory</h3>
              <p>From search strategy to completion, every detail is managed with precision.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeader title="Leadership and Advisory Team" />
          <div className="grid-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Work With a Team That Understands Prestige Real Estate" />
    </>
  )
}

export default About
