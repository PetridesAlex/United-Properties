import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import AgentCard from '../components/AgentCard/AgentCard'
import CTASection from '../components/CTASection/CTASection'
import CmsText from '../components/CmsPreview/CmsText'
import { agents } from '../data/agents'
import { useSiteContent } from '../hooks/useSiteContent'
import './About.css'

function About() {
  const { get } = useSiteContent()

  return (
    <>
      <Helmet>
        <title>{get('about', 'seo', 'title', 'About | United Properties')}</title>
        <meta
          name="description"
          content={get(
            'about',
            'seo',
            'description',
            'Trusted Cyprus real estate advisory for luxury homes, investments, and relocation.',
          )}
        />
      </Helmet>

      <section className="page-hero" data-cms-page="about" data-cms-section="hero">
        <div className="container">
          <CmsText page="about" section="hero" field="eyebrow" as="p">
            {get('about', 'hero', 'eyebrow')}
          </CmsText>
          <CmsText page="about" section="hero" field="heading" as="h1">
            {get('about', 'hero', 'heading')}
          </CmsText>
          <CmsText page="about" section="hero" field="description" as="p">
            {get('about', 'hero', 'description')}
          </CmsText>
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
              cmsPage="about"
              cmsSection="story"
            />
            <CmsText page="about" section="story" field="body" as="p">
              {get('about', 'story', 'body')}
            </CmsText>
            <CmsText page="about" section="story" field="mission_heading" as="h3">
              {get('about', 'story', 'mission_heading')}
            </CmsText>
            <CmsText page="about" section="story" field="mission" as="p">
              {get('about', 'story', 'mission')}
            </CmsText>
            <CmsText page="about" section="story" field="values_heading" as="h3">
              {get('about', 'story', 'values_heading')}
            </CmsText>
            <CmsText page="about" section="story" field="values" as="p">
              {get('about', 'story', 'values')}
            </CmsText>
            <Link to="/contact" className="btn btn-outline-dark">
              <CmsText page="about" section="story" field="cta_label" as="span">
                {get('about', 'story', 'cta_label', 'Book a Consultation')}
              </CmsText>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--alt" data-cms-page="about" data-cms-section="why">
        <div className="container">
          <SectionHeader
            title={get('about', 'why', 'heading')}
            description={get('about', 'why', 'description')}
            cmsPage="about"
            cmsSection="why"
          />
          <div className="grid-3">
            <article className="card-luxury about-point">
              <CmsText page="about" section="why" field="point1_title" as="h3">
                {get('about', 'why', 'point1_title')}
              </CmsText>
              <CmsText page="about" section="why" field="point1_body" as="p">
                {get('about', 'why', 'point1_body')}
              </CmsText>
            </article>
            <article className="card-luxury about-point">
              <CmsText page="about" section="why" field="point2_title" as="h3">
                {get('about', 'why', 'point2_title')}
              </CmsText>
              <CmsText page="about" section="why" field="point2_body" as="p">
                {get('about', 'why', 'point2_body')}
              </CmsText>
            </article>
            <article className="card-luxury about-point">
              <CmsText page="about" section="why" field="point3_title" as="h3">
                {get('about', 'why', 'point3_title')}
              </CmsText>
              <CmsText page="about" section="why" field="point3_body" as="p">
                {get('about', 'why', 'point3_body')}
              </CmsText>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--light" data-cms-page="about" data-cms-section="team">
        <div className="container">
          <SectionHeader
            title={get('about', 'team', 'heading')}
            cmsPage="about"
            cmsSection="team"
          />
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
