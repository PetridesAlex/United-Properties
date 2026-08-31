import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, Phone, MapPin, Clock4 } from 'lucide-react'

const MotionH2 = motion.h2
const MotionP = motion.p
const MotionHeader = motion.header
const MotionA = motion.a

const contactMethodVariants = ['whatsapp', 'email', 'call']
import InquiryForm from '../components/InquiryForm/InquiryForm'
import { TelegramBrandIcon } from '../components/Navbar/SocialBrandIcons'
import { TELEGRAM_CHAT_URL, WHATSAPP_CHAT_URL } from '../config/externalLinks'
import { useSiteContent } from '../hooks/useSiteContent'
import './Contact.css'

function Contact() {
  const { get } = useSiteContent()

  const officeAddress = get('contact', 'office', 'address', '18 Marina Avenue, Limassol, Cyprus')
  const officePhone = get('contact', 'office', 'phone', '+357 25 123 456')
  const officeEmail = get('contact', 'office', 'email', 'info@unitedproperties.eu')
  const officeHours = get('contact', 'office', 'hours', 'Mon - Fri: 9:00 - 18:00')
  const phoneHref = `tel:${officePhone.replace(/\s+/g, '')}`
  const emailHref = `mailto:${officeEmail}`

  const contactMethods = [
    {
      icon: MessageCircle,
      title: get('contact', 'methods', 'whatsapp_title', 'WhatsApp'),
      subtitle: get('contact', 'methods', 'whatsapp_subtitle', 'Fast answers from our team'),
      href: WHATSAPP_CHAT_URL,
      external: true,
    },
    {
      icon: Mail,
      title: get('contact', 'methods', 'email_title', 'Email us'),
      subtitle: get('contact', 'methods', 'email_subtitle', 'info@unitedproperties.eu'),
      href: emailHref,
      external: false,
    },
    {
      icon: Phone,
      title: get('contact', 'methods', 'call_title', 'Call us'),
      subtitle: get('contact', 'methods', 'call_subtitle', '+357 25 123 456'),
      href: phoneHref,
      external: false,
    },
  ]

  return (
    <>
      <Helmet>
        <title>Contact | United Properties</title>
      </Helmet>

      <section className="page-hero page-hero--contact">
        <div className="container">
          <p>{get('contact', 'hero', 'eyebrow')}</p>
          <h1>{get('contact', 'hero', 'heading')}</h1>
          <p>{get('contact', 'hero', 'description')}</p>
        </div>
      </section>

      <section className="contact-intro section section--light">
        <div className="contact-intro__ambient" aria-hidden />
        <div className="container contact-intro__inner">
          <MotionHeader
            className="contact-intro__header"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5 }}
          >
            <MotionP
              className="contact-intro__eyebrow"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45 }}
            >
              {get('contact', 'intro', 'eyebrow')}
            </MotionP>
            <div className="contact-intro__rule" aria-hidden />
            <MotionH2
              className="contact-intro__title"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.48, delay: 0.06 }}
            >
              {get('contact', 'intro', 'heading')}
            </MotionH2>
            <MotionP
              className="contact-intro__subtitle"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.48, delay: 0.12 }}
            >
              {get('contact', 'intro', 'description')}
            </MotionP>
          </MotionHeader>

          <div className="contact-methods">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              const variant = contactMethodVariants[index] ?? 'call'
              return (
                <MotionA
                  key={`${variant}-${method.title}`}
                  href={method.href}
                  className={`contact-method-card contact-method-card--${variant}`}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.42, delay: 0.12 + index * 0.08 }}
                  {...(method.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  <div className="contact-method-card__icon-area">
                    <div className="contact-method-card__glow contact-method-card__glow--outer" aria-hidden />
                    <div className="contact-method-card__glow contact-method-card__glow--inner" aria-hidden />
                    <div className="contact-method-card__icon-shell">
                      <Icon className="contact-method-card__icon" strokeWidth={1.5} aria-hidden />
                    </div>
                  </div>
                  <div className="contact-method-card__text">
                    <h3 className="contact-method-card__heading">{method.title}</h3>
                    <p className="contact-method-card__hint">{method.subtitle}</p>
                  </div>
                </MotionA>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section section--light contact-section">
        <div className="container contact-grid">
          <div className="contact-grid__details">
            <article className="card-luxury contact-card">
              <h3>{get('contact', 'office', 'heading', 'Office')}</h3>
              <p>
                <MapPin size={16} aria-hidden /> {officeAddress}
              </p>
              <p>
                <Phone size={16} aria-hidden /> <a href={phoneHref}>{officePhone}</a>
              </p>
              <p>
                <Mail size={16} aria-hidden /> <a href={emailHref}>{officeEmail}</a>
              </p>
              <p>
                <Clock4 size={16} aria-hidden /> {officeHours}
              </p>
            </article>

            <article className="card-luxury contact-card">
              <h3>{get('contact', 'telegram', 'heading', 'Telegram')}</h3>
              <p>
                {get(
                  'contact',
                  'telegram',
                  'body',
                  'Continue the conversation on Telegram if you prefer.',
                )}
              </p>
              <div
                className="contact-card__messengers"
                role="group"
                aria-label={get('contact', 'telegram', 'heading', 'Telegram')}
              >
                <a
                  href={TELEGRAM_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card__messenger contact-card__messenger--telegram"
                  aria-label="Open Telegram chat"
                >
                  <TelegramBrandIcon size={28} />
                  <span>{get('contact', 'telegram', 'link_label', 'Telegram')}</span>
                </a>
              </div>
            </article>

            <article className="card-luxury contact-card contact-card--map">
              <h3>{get('contact', 'map', 'heading', 'Map')}</h3>
              <div className="contact-card__map">
                <iframe
                  title={`United Properties — ${officeAddress}`}
                  className="contact-card__map-frame"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(officeAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
              <p className="contact-card__map-caption">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {get('contact', 'map', 'open_maps_label', 'Open in Google Maps')}
                </a>
              </p>
            </article>
          </div>

          <InquiryForm />
        </div>
      </section>
    </>
  )
}

export default Contact
