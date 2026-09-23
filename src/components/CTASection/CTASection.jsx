import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useSiteContent } from '../../hooks/useSiteContent'
import CmsText from '../CmsPreview/CmsText'
import './CTASection.css'

function CTASection({
  title,
  description,
  primaryTo = '/properties',
  primaryLabel,
  cmsPage = 'home',
  cmsSection = 'cta',
}) {
  const { get } = useSiteContent()
  const resolvedTitle =
    title ??
    get(cmsPage, cmsSection, 'heading', get('home', 'cta', 'heading', 'Ready to Find Your Ideal Property in Cyprus?'))
  const resolvedDescription =
    description ??
    get(
      cmsPage,
      cmsSection,
      'description',
      get(
        'home',
        'cta',
        'description',
        'Connect with our advisors for a tailored strategy across premium Cyprus locations.',
      ),
    )
  const listingsLabel =
    primaryLabel ??
    get(cmsPage, cmsSection, 'btn_listings', get('home', 'cta', 'btn_listings', 'View Listings'))
  const contactLabel = get(
    cmsPage,
    cmsSection,
    'btn_contact',
    get('home', 'cta', 'btn_contact', 'Contact Our Team'),
  )
  const whatsappLabel = get(
    cmsPage,
    cmsSection,
    'btn_whatsapp',
    get('home', 'cta', 'btn_whatsapp', 'WhatsApp'),
  )

  return (
    <section
      className="cta-section section"
      data-cms-page={cmsPage}
      data-cms-section={cmsSection}
    >
      <div className="container">
        <div className="cta-section__panel">
          <CmsText page={cmsPage} section={cmsSection} field="heading" as="h2">
            {resolvedTitle}
          </CmsText>
          <CmsText page={cmsPage} section={cmsSection} field="description" as="p">
            {resolvedDescription}
          </CmsText>
          <div className="cta-section__actions">
            <Link to={primaryTo} className="btn btn-gold">
              <CmsText page={cmsPage} section={cmsSection} field="btn_listings" as="span">
                {listingsLabel}
              </CmsText>
            </Link>
            <Link to="/contact" className="btn btn-outline-light">
              <CmsText page={cmsPage} section={cmsSection} field="btn_contact" as="span">
                {contactLabel}
              </CmsText>
            </Link>
            <a
              href="https://wa.me/35700000000"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-light"
            >
              <MessageCircle size={16} />{' '}
              <CmsText page={cmsPage} section={cmsSection} field="btn_whatsapp" as="span">
                {whatsappLabel}
              </CmsText>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
