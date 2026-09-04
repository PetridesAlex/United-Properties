import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import AgentCard from '../components/AgentCard/AgentCard'
import CTASection from '../components/CTASection/CTASection'
import { agents } from '../data/agents'
import { useSiteContent } from '../hooks/useSiteContent'
import './About.css'

function About() {
  const { get } = useSiteContent()

  return (
    <>
      <Helmet>
        <title>About Us | United Properties</title>
      </Helmet>

      <section className="page-hero" data-cms-page="about" data-cms-section="hero">
        <div className="container">
          <p>{get('about', 'hero', 'eyebrow')}</p>
          <h1>{get('about', 'hero', 'heading')}</h1>
          <p>{get('about', 'hero', 'description')}</p>
        </div>
      </section>

      <section className="section section--light" data-cms-page="about" data-cms-section="story">
        <div className="container about-grid">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1500&q=80"
            alt="United Properties office lounge"
          />
          <div>
            <SectionHeader
              eyebrow={get('about', 'story', 'eyebrow')}
              title={get('about', 'story', 'heading')}
            />
            <p>{get('about', 'story', 'body')}</p>
            <h3>{get('about', 'story', 'mission_heading')}</h3>
            <p>{get('about', 'story', 'mission')}</p>
            <h3>{get('about', 'story', 'values_heading')}</h3>
            <p>{get('about', 'story', 'values')}</p>
            <Link to="/contact" className="btn btn-outline-dark">
              {get('about', 'story', 'cta_label', 'Book a Consultation')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--alt" data-cms-page="about" data-cms-section="why">
        <div className="container">
          <SectionHeader
            title={get('about', 'why', 'heading')}
            description={get('about', 'why', 'description')}
          />
          <div className="grid-3">
            <article className="card-luxury about-point">
              <h3>{get('about', 'why', 'point1_title')}</h3>
              <p>{get('about', 'why', 'point1_body')}</p>
            </article>
            <article className="card-luxury about-point">
              <h3>{get('about', 'why', 'point2_title')}</h3>
              <p>{get('about', 'why', 'point2_body')}</p>
            </article>
            <article className="card-luxury about-point">
              <h3>{get('about', 'why', 'point3_title')}</h3>
              <p>{get('about', 'why', 'point3_body')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--light" data-cms-page="about" data-cms-section="team">
        <div className="container">
          <SectionHeader title={get('about', 'team', 'heading')} />
          <div className="grid-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      <CTASection title={get('about', 'cta', 'heading')} cmsPage="about" cmsSection="cta" />
    </>
  )
}

export default About
