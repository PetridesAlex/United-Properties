import { motion, useReducedMotion } from 'framer-motion'
import { Phone, Scale } from 'lucide-react'
import CmsText from '../CmsPreview/CmsText'
import { useSiteContent } from '../../hooks/useSiteContent'
import {
  EmailBrandIcon,
  TelegramBrandIcon,
  WhatsAppBrandIcon,
} from '../Navbar/SocialBrandIcons'
import {
  CONTACT_MAILTO_HREF,
  CONTACT_PHONE_TEL,
  TELEGRAM_CHAT_URL,
  WHATSAPP_CHAT_URL,
} from '../../config/externalLinks'
import './SellWithUsSection.css'

const POINT_DEFAULTS = [
  {
    key: 'price',
    title: 'A fair price',
    body:
      "A fair price does two things. It honors the true value of your property, and it gives the buyer the confidence to say yes. That's the price we believe in, built on comparable sales and real local knowledge.",
  },
  {
    key: 'presented',
    title: 'Presented at its best',
    body: "Professional marketing that shows your property's true potential.",
  },
  {
    key: 'buyers',
    title: 'The right buyers',
    body:
      "From first-time buyers to high net worth individuals and investors, our network reaches people who know exactly what they're looking for. Every enquiry is screened, so your time goes only to buyers who are genuinely ready.",
  },
  {
    key: 'completion',
    title: 'With you until completion',
    body: 'We guide you through every step of the sale.',
  },
]

const gridReveal = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
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

function SellWithUsSection() {
  const { get } = useSiteContent()
  const reduceMotion = useReducedMotion()

  const points = POINT_DEFAULTS.map((item) => ({
    key: item.key,
    title: get('services', 'sell_offer', `${item.key}_title`, item.title),
    body: get('services', 'sell_offer', `${item.key}_body`, item.body),
  }))

  const callLabel = get('services', 'sell_offer', 'btn_call', 'Call')
  const whatsappLabel = get('services', 'sell_offer', 'btn_whatsapp', 'WhatsApp')
  const telegramLabel = get('services', 'sell_offer', 'btn_telegram', 'Telegram')
  const emailLabel = get('services', 'sell_offer', 'btn_email', 'Email')

  return (
    <section
      id="sell-with-us"
      className="section section--light sell-with-us-offer"
      aria-labelledby="sell-with-us-heading"
      data-cms-page="services"
      data-cms-section="sell_offer"
    >
      <div className="sell-with-us-offer__ambient" aria-hidden />
      <div className="container">
        <motion.header
          className="sell-with-us-offer__header"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <CmsText
            page="services"
            section="sell_offer"
            field="eyebrow"
            as="p"
            className="sell-with-us-offer__eyebrow"
          >
            {get('services', 'sell_offer', 'eyebrow', 'United Services')}
          </CmsText>
          <CmsText
            page="services"
            section="sell_offer"
            field="heading"
            as="h2"
            id="sell-with-us-heading"
            className="sell-with-us-offer__heading"
          >
            {get('services', 'sell_offer', 'heading', 'Sell with us')}
          </CmsText>
          <div className="sell-with-us-offer__intro">
            <CmsText
              page="services"
              section="sell_offer"
              field="lead"
              as="p"
              className="sell-with-us-offer__lead"
            >
              {get('services', 'sell_offer', 'lead', 'Not just sold. Sold right.')}
            </CmsText>
            <CmsText
              page="services"
              section="sell_offer"
              field="support"
              as="p"
              className="sell-with-us-offer__support"
            >
              {get(
                'services',
                'sell_offer',
                'support',
                "Your property deserves more than a listing. Here's how we sell it.",
              )}
            </CmsText>
          </div>
        </motion.header>

        <motion.ul
          className="sell-with-us-offer__grid"
          variants={reduceMotion ? undefined : gridReveal}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
        >
          {points.map((item, index) => (
            <motion.li
              key={item.key}
              className="sell-with-us-offer__card"
              variants={reduceMotion ? undefined : cardReveal}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <span className="sell-with-us-offer__card-sheen" aria-hidden />
              <span className="sell-with-us-offer__card-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <CmsText
                page="services"
                section="sell_offer"
                field={`${item.key}_title`}
                as="h3"
                className="sell-with-us-offer__card-title"
              >
                {item.title}
              </CmsText>
              <CmsText
                page="services"
                section="sell_offer"
                field={`${item.key}_body`}
                as="p"
                className="sell-with-us-offer__card-body"
              >
                {item.body}
              </CmsText>
            </motion.li>
          ))}
        </motion.ul>

        <motion.aside
          className="sell-with-us-offer__legal"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduceMotion ? undefined : { y: -3 }}
          aria-label="Legal support"
        >
          <span className="sell-with-us-offer__legal-glow" aria-hidden />
          <span className="sell-with-us-offer__legal-sheen" aria-hidden />
          <span className="sell-with-us-offer__legal-accent" aria-hidden />

          <motion.span
            className="sell-with-us-offer__legal-icon"
            aria-hidden
            initial={reduceMotion ? false : { opacity: 0, scale: 0.65 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.1 }}
          >
            <span className="sell-with-us-offer__legal-icon-ring" />
            <Scale size={20} strokeWidth={1.85} />
          </motion.span>

          <div className="sell-with-us-offer__legal-copy">
            <div className="sell-with-us-offer__legal-head">
              <p className="sell-with-us-offer__legal-label">
                {get('services', 'sell_offer', 'legal_label', 'Legal support')}
              </p>
              <span className="sell-with-us-offer__legal-badge">
                {get('services', 'sell_offer', 'legal_badge', 'On request')}
              </span>
            </div>
            <CmsText
              page="services"
              section="sell_offer"
              field="legal_body"
              as="p"
              className="sell-with-us-offer__legal-body"
            >
              {get(
                'services',
                'sell_offer',
                'legal_body',
                'An additional service from our trusted legal partners, guiding your deal to a safe and successful close.',
              )}
            </CmsText>
            <ul className="sell-with-us-offer__legal-points">
              {[
                get('services', 'sell_offer', 'legal_point1', 'Trusted partners'),
                get('services', 'sell_offer', 'legal_point2', 'Deal guidance'),
                get('services', 'sell_offer', 'legal_point3', 'Safe close'),
              ].map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </motion.aside>

        <motion.div
          className="sell-with-us-offer__cta"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="sell-with-us-offer__cta-glow" aria-hidden />
          <span className="sell-with-us-offer__cta-sheen" aria-hidden />
          <div className="sell-with-us-offer__cta-copy">
            <CmsText
              page="services"
              section="sell_offer"
              field="cta_heading"
              as="h3"
              className="sell-with-us-offer__cta-heading"
            >
              {get('services', 'sell_offer', 'cta_heading', 'Tell us about your property.')}
            </CmsText>
            <CmsText
              page="services"
              section="sell_offer"
              field="cta_body"
              as="p"
              className="sell-with-us-offer__cta-body"
            >
              {get(
                'services',
                'sell_offer',
                'cta_body',
                'We choose potential over volume. Let us review your property and give you an honest view of its potential and its price.',
              )}
            </CmsText>
          </div>
          <motion.div
            className="sell-with-us-offer__actions"
            variants={reduceMotion ? undefined : gridReveal}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            {[
              {
                href: CONTACT_PHONE_TEL,
                label: callLabel,
                field: 'btn_call',
                primary: true,
                brand: 'call',
                Icon: Phone,
              },
              {
                href: WHATSAPP_CHAT_URL,
                label: whatsappLabel,
                field: 'btn_whatsapp',
                external: true,
                brand: 'whatsapp',
                Icon: WhatsAppBrandIcon,
              },
              {
                href: TELEGRAM_CHAT_URL,
                label: telegramLabel,
                field: 'btn_telegram',
                external: true,
                brand: 'telegram',
                Icon: TelegramBrandIcon,
              },
              {
                href: CONTACT_MAILTO_HREF,
                label: emailLabel,
                field: 'btn_email',
                brand: 'email',
                Icon: EmailBrandIcon,
              },
            ].map((action) => {
              const Icon = action.Icon
              return (
                <motion.a
                  key={action.field}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noreferrer' : undefined}
                  className={`btn ${action.primary ? 'btn-gold' : 'btn-outline-light'} sell-with-us-offer__action sell-with-us-offer__action--${action.brand}`}
                  variants={reduceMotion ? undefined : cardReveal}
                  whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  <Icon
                    size={22}
                    className="sell-with-us-offer__action-icon"
                    strokeWidth={action.brand === 'call' ? 2.15 : undefined}
                    aria-hidden
                  />
                  <CmsText page="services" section="sell_offer" field={action.field} as="span">
                    {action.label}
                  </CmsText>
                </motion.a>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default SellWithUsSection
