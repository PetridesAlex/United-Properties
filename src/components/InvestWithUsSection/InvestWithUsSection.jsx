import { motion, useReducedMotion } from 'framer-motion'
import CmsText from '../CmsPreview/CmsText'
import CmsStaggeredHeading from '../StaggeredText/CmsStaggeredHeading'
import { useSiteContent } from '../../hooks/useSiteContent'
import './InvestWithUsSection.css'

const OFFERING_DEFAULTS = [
  {
    key: 'packages',
    title: 'Investment packages',
    body:
      'Complete opportunities built around your budget and goals, with the property, the numbers, and the next steps laid out clearly.',
  },
  {
    key: 'land',
    title: 'Land, with the research behind it',
    body:
      'Know what a plot can become before you buy it. We research what can be built on the land, so you invest in real potential.',
  },
  {
    key: 'apartments',
    title: 'Apartments with clear returns',
    body:
      'Apartments chosen for rental demand, presented with a transparent ROI estimate, so you know the numbers before you decide.',
  },
  {
    key: 'homes',
    title: 'Homes that hold their value',
    body:
      'Houses selected for long-term value, in places people will want to live for years to come. A home to enjoy today. An asset for tomorrow.',
  },
]

const gridReveal = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
}

const cardReveal = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

function InvestWithUsSection() {
  const { get } = useSiteContent()
  const reduceMotion = useReducedMotion()

  const offerings = OFFERING_DEFAULTS.map((item) => ({
    key: item.key,
    title: get('services', 'invest_offer', `${item.key}_title`, item.title),
    body: get('services', 'invest_offer', `${item.key}_body`, item.body),
  }))

  return (
    <section
      id="invest-with-us"
      className="section section--alt invest-with-us"
      aria-labelledby="invest-with-us-heading"
      data-cms-page="services"
      data-cms-section="invest_offer"
    >
      <div className="invest-with-us__ambient" aria-hidden />
      <div className="container">
        <motion.header
          className="invest-with-us__header"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <CmsText
            page="services"
            section="invest_offer"
            field="eyebrow"
            as="p"
            className="invest-with-us__eyebrow"
          >
            {get('services', 'invest_offer', 'eyebrow', 'United Services')}
          </CmsText>
          <CmsStaggeredHeading
            page="services"
            section="invest_offer"
            field="heading"
            as="h2"
            id="invest-with-us-heading"
            className="invest-with-us__heading"
            text={get('services', 'invest_offer', 'heading', 'Invest with us')}
          />
          <div className="invest-with-us__intro">
            <CmsText
              page="services"
              section="invest_offer"
              field="lead"
              as="p"
              className="invest-with-us__lead"
            >
              {get('services', 'invest_offer', 'lead', 'We choose potential over volume.')}
            </CmsText>
            <CmsText
              page="services"
              section="invest_offer"
              field="support"
              as="p"
              className="invest-with-us__support"
            >
              {get(
                'services',
                'invest_offer',
                'support',
                "Every investor has a different goal. Here's how we help you reach yours.",
              )}
            </CmsText>
          </div>
        </motion.header>

        <div className="invest-with-us__offerings">
          <motion.ul
            className="invest-with-us__grid"
            variants={reduceMotion ? undefined : gridReveal}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
          >
            {offerings.map((item, index) => (
              <motion.li
                key={item.key}
                className="invest-with-us__card"
                variants={reduceMotion ? undefined : cardReveal}
                whileHover={reduceMotion ? undefined : { y: -6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <span className="invest-with-us__card-sheen" aria-hidden />
                <span className="invest-with-us__card-glow" aria-hidden />
                <span className="invest-with-us__card-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <CmsText
                  page="services"
                  section="invest_offer"
                  field={`${item.key}_title`}
                  as="h3"
                  className="invest-with-us__card-title"
                >
                  {item.title}
                </CmsText>
                <CmsText
                  page="services"
                  section="invest_offer"
                  field={`${item.key}_body`}
                  as="p"
                  className="invest-with-us__card-body"
                >
                  {item.body}
                </CmsText>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.blockquote
          className="invest-with-us__close"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="invest-with-us__close-rule" aria-hidden />
          <CmsText
            page="services"
            section="invest_offer"
            field="close_body"
            as="p"
            className="invest-with-us__close-body"
          >
            {get(
              'services',
              'invest_offer',
              'close_body',
              "Potential comes in many forms. A plot with a view. An apartment in the right location. An older house waiting for its next chapter. Whatever you choose, you get real local knowledge. If we believe in an opportunity, you'll hear it from us. If we don't, you'll hear that too.",
            )}
          </CmsText>
        </motion.blockquote>
      </div>
    </section>
  )
}

export default InvestWithUsSection
