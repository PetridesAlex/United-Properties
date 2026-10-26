import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useSiteContent } from '../../hooks/useSiteContent'
import CmsText from '../CmsPreview/CmsText'
import CmsStaggeredHeading from '../StaggeredText/CmsStaggeredHeading'
import { WhatsAppBrandIcon } from '../Navbar/SocialBrandIcons'
import { WHATSAPP_CHAT_URL } from '../../config/externalLinks'
import './CTASection.css'

const panelReveal = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
}

const itemReveal = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

function CTASection({
  title,
  description,
  primaryTo = '/properties',
  primaryLabel,
  cmsPage = 'home',
  cmsSection = 'cta',
}) {
  const { get } = useSiteContent()
  const reduceMotion = useReducedMotion()
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
        <motion.div
          className="cta-section__panel"
          variants={reduceMotion ? undefined : panelReveal}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <span className="cta-section__glow" aria-hidden />
          <span className="cta-section__sheen" aria-hidden />
          <span className="cta-section__accent" aria-hidden />

          <motion.div className="cta-section__copy" variants={reduceMotion ? undefined : itemReveal}>
            <p className="cta-section__eyebrow">United Properties</p>
            <CmsStaggeredHeading
              page={cmsPage}
              section={cmsSection}
              field="heading"
              as="h2"
              className="cta-section__heading"
              text={resolvedTitle}
            />
            <CmsText
              page={cmsPage}
              section={cmsSection}
              field="description"
              as="p"
              className="cta-section__description"
            >
              {resolvedDescription}
            </CmsText>
          </motion.div>

          <div className="cta-section__actions">
            <motion.div variants={reduceMotion ? undefined : itemReveal}>
              <Link to={primaryTo} className="btn btn-gold cta-section__btn">
                <CmsText page={cmsPage} section={cmsSection} field="btn_listings" as="span">
                  {listingsLabel}
                </CmsText>
              </Link>
            </motion.div>
            <motion.div variants={reduceMotion ? undefined : itemReveal}>
              <Link to="/contact" className="btn btn-outline-light cta-section__btn">
                <CmsText page={cmsPage} section={cmsSection} field="btn_contact" as="span">
                  {contactLabel}
                </CmsText>
              </Link>
            </motion.div>
            <motion.div variants={reduceMotion ? undefined : itemReveal}>
              <a
                href={WHATSAPP_CHAT_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-light cta-section__btn cta-section__btn--whatsapp"
              >
                <WhatsAppBrandIcon size={16} className="cta-section__whatsapp-icon" />
                <CmsText page={cmsPage} section={cmsSection} field="btn_whatsapp" as="span">
                  {whatsappLabel}
                </CmsText>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection
