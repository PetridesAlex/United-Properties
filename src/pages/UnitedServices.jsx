import { useEffect, useState } from 'react'
import CmsText from '../components/CmsPreview/CmsText'
import { useSiteContent } from '../hooks/useSiteContent'
import './UnitedServices.css'

const PHRASES = [
  'A plot with a view.',
  'An apartment in the right location.',
  'An older house waiting for its next chapter.',
]

const PM_FEATURES = [
  { key: 'screening', label: 'Tenant screening and placement', placement: true, full: true },
  { key: 'marketing', label: 'Marketing through our channels and network', placement: true, full: true },
  { key: 'agreement', label: 'Rental agreement drafting', placement: true, full: true },
  { key: 'support', label: 'Personal support during the whole tenancy period', placement: true, full: true },
  { key: 'rent', label: 'Rent collection', placement: false, full: true, accent: true },
  { key: 'maintenance', label: 'Maintenance and repairs', placement: false, full: true },
  { key: 'checks', label: 'Property checks and performance reports', placement: false, full: true },
  { key: 'utilities', label: 'Utilities and bills', placement: false, full: true },
]

function go(event, id) {
  const el = document.getElementById(id)
  if (!el) return
  event.preventDefault()
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

function useNavbarOffset() {
  const [offsets, setOffsets] = useState({ top: 0, mnav: 72 })

  useEffect(() => {
    function measure() {
      const nav = document.querySelector('header.navbar')
      const mnav = document.querySelector('.up-services .mnav')
      const top = nav ? Math.round(nav.getBoundingClientRect().height) : 0
      const mnavH = mnav ? Math.round(mnav.getBoundingClientRect().height) : 72
      setOffsets((prev) => (prev.top === top && prev.mnav === mnavH ? prev : { top, mnav: mnavH }))
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [])

  return offsets
}

function UnitedServices() {
  const { get } = useSiteContent()
  const offsets = useNavbarOffset()
  const [idx, setIdx] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduceMotion) return undefined
    const t = setInterval(() => setIdx((i) => (i + 1) % PHRASES.length), 3200)
    return () => clearInterval(t)
  }, [reduceMotion])

  const introWords = ['Three', 'clear', 'paths.']
  const headingRaw = get(
    'services',
    'hero_switch',
    'heading',
    'Three clear paths.',
  )
  const headingTrimmed = String(headingRaw || '').trim()
  const isLegacyHeroHeading = /^united\s+services\.?$/i.test(headingTrimmed)
  const displayHeading =
    isLegacyHeroHeading || /move\s+forward\s+with\s+clarity/i.test(headingTrimmed)
      ? 'Three clear paths.'
      : headingTrimmed
  const useAnimatedHeading = /^three\s+clear\s+paths\.?$/i.test(displayHeading)

  const supportRaw = get(
    'services',
    'hero_switch',
    'support',
    'Invest, sell, or let us manage your property.',
  )
  const introSupport =
    /entrust us with management|boutique standard of care|results that hold up|every path starts with honest advice/i.test(
      String(supportRaw || ''),
    )
      ? 'Invest, sell, or let us manage your property.'
      : supportRaw

  const ctaHeadingRaw = get('services', 'cta', 'heading', 'Tell us your goal.')
  const ctaHeading = /discuss your property goals|advisory team/i.test(String(ctaHeadingRaw || ''))
    ? 'Tell us your goal.'
    : ctaHeadingRaw
  const ctaDescRaw = get(
    'services',
    'cta',
    'description',
    "Invest, sell or rent, and we'll give you an honest view of what's possible.",
  )
  const ctaDescription = /tailored strategy|premium Cyprus locations/i.test(String(ctaDescRaw || ''))
    ? "Invest, sell or rent, and we'll give you an honest view of what's possible."
    : ctaDescRaw

  const investRows = [
    {
      key: 'packages',
      title: get('services', 'invest_offer', 'packages_title', 'Investment packages'),
      body: get(
        'services',
        'invest_offer',
        'packages_body',
        'Complete opportunities built around your budget and goals, with the property, the numbers, and the next steps laid out clearly.',
      ),
    },
    {
      key: 'land',
      title: get('services', 'invest_offer', 'land_title', 'Land, with the research behind it'),
      body: get(
        'services',
        'invest_offer',
        'land_body',
        'Know what a plot can become before you buy it. We research what can be built on the land, so you invest in real potential.',
      ),
    },
    {
      key: 'apartments',
      title: get('services', 'invest_offer', 'apartments_title', 'Apartments with clear returns'),
      body: get(
        'services',
        'invest_offer',
        'apartments_body',
        'Apartments chosen for rental demand, presented with a transparent ROI estimate, so you know the numbers before you decide.',
      ),
    },
    {
      key: 'homes',
      title: get('services', 'invest_offer', 'homes_title', 'Homes that hold their value'),
      body: get(
        'services',
        'invest_offer',
        'homes_body',
        'Houses selected for long-term value, in places people will want to live for years to come. A home to enjoy today. An asset for tomorrow.',
      ),
    },
  ]

  const sellPriceBodyRaw = get(
    'services',
    'sell_offer',
    'price_body',
    "A price that honors your property's true value and gives the buyer the confidence to say yes. Built on comparable sales and real local knowledge.",
  )
  const sellPriceBody = /does two things/i.test(String(sellPriceBodyRaw || ''))
    ? "A price that honors your property's true value and gives the buyer the confidence to say yes. Built on comparable sales and real local knowledge."
    : sellPriceBodyRaw

  const sellBuyersBodyRaw = get(
    'services',
    'sell_offer',
    'buyers_body',
    "From first-time buyers to high net worth individuals and investors, our network reaches people who know what they're looking for. Every enquiry is screened, so your time goes to buyers who are genuinely ready.",
  )
  const sellBuyersBody = /know exactly what|goes only to buyers/i.test(String(sellBuyersBodyRaw || ''))
    ? "From first-time buyers to high net worth individuals and investors, our network reaches people who know what they're looking for. Every enquiry is screened, so your time goes to buyers who are genuinely ready."
    : sellBuyersBodyRaw

  const sellRows = [
    {
      key: 'price',
      title: get('services', 'sell_offer', 'price_title', 'A fair price'),
      body: sellPriceBody,
    },
    {
      key: 'presented',
      title: get('services', 'sell_offer', 'presented_title', 'Presented at its best'),
      body: get(
        'services',
        'sell_offer',
        'presented_body',
        "Professional marketing that shows your property's true potential.",
      ),
    },
    {
      key: 'buyers',
      title: get('services', 'sell_offer', 'buyers_title', 'The right buyers'),
      body: sellBuyersBody,
    },
  ]

  return (
    <div className="up-services" style={{ '--up-top': `${offsets.top}px`, '--up-mnav': `${offsets.mnav}px` }}>
      <section className="up-intro" data-cms-page="services" data-cms-section="hero_switch">
        <div className="up-services__shell up-intro__inner">
          <CmsText page="services" section="hero_switch" field="eyebrow" as="span" className="lbl">
            {get('services', 'hero_switch', 'eyebrow', 'United Services')}
          </CmsText>
          {useAnimatedHeading && !reduceMotion ? (
            <h1 className="intro-title" aria-label={displayHeading}>
              {introWords.slice(0, 3).map((word, i) => (
                <span key={word} className="bw" style={{ animationDelay: `${0.05 + i * 0.1}s` }}>
                  {word}
                </span>
              ))}
              <br />
              {introWords.slice(3).map((word, i) => (
                <span key={word} className="bw" style={{ animationDelay: `${0.45 + i * 0.1}s` }}>
                  {word}
                </span>
              ))}
            </h1>
          ) : (
            <CmsText page="services" section="hero_switch" field="heading" as="h1" className="intro-title">
              {displayHeading}
            </CmsText>
          )}
          <CmsText
            page="services"
            section="hero_switch"
            field="support"
            as="p"
            className={`intro-support${reduceMotion ? '' : ' fc'}`}
          >
            {introSupport}
          </CmsText>
        </div>
      </section>

      <nav className="mnav" aria-label="United Services sections">
        <div className="up-services__shell mnav__inner">
          <a className="jump" href="#invest-with-us" onClick={(e) => go(e, 'invest-with-us')}>
            Invest<span className="wu"> with us</span>
          </a>
          <a className="jump" href="#sell-with-us" onClick={(e) => go(e, 'sell-with-us')}>
            Sell<span className="wu"> with us</span>
          </a>
          <a className="jump" href="#property-management" onClick={(e) => go(e, 'property-management')}>
            Property management
          </a>
        </div>
      </nav>

      <section
        id="invest-with-us"
        className="sec"
        data-cms-page="services"
        data-cms-section="invest_offer"
        aria-labelledby="invest-with-us-heading"
      >
        <div className="two up-services__shell">
          <div className="stick">
            <span className="lbl">01 &nbsp;Invest with us</span>
            <CmsText
              page="services"
              section="invest_offer"
              field="lead"
              as="h2"
              id="invest-with-us-heading"
              className="h2"
            >
              {get('services', 'invest_offer', 'lead', 'We choose potential over volume.')}
            </CmsText>
            <CmsText page="services" section="invest_offer" field="support" as="p" className="lead">
              {get(
                'services',
                'invest_offer',
                'support',
                "Every investor has a different goal. Here's how we help you reach yours.",
              )}
            </CmsText>
          </div>
          <CmsText page="services" section="invest_offer" field="support" as="p" className="lead-m">
            {get(
              'services',
              'invest_offer',
              'support',
              "Every investor has a different goal. Here's how we help you reach yours.",
            )}
          </CmsText>
          <div className="paper">
            {investRows.map((row) => (
              <div className="row" key={row.key}>
                <CmsText
                  page="services"
                  section="invest_offer"
                  field={`${row.key}_title`}
                  as="h3"
                  className="rowt"
                >
                  {row.title}
                </CmsText>
                <CmsText
                  page="services"
                  section="invest_offer"
                  field={`${row.key}_body`}
                  as="p"
                  className="rowp"
                >
                  {row.body}
                </CmsText>
              </div>
            ))}
            <div className="after">
              <h3>Potential comes in many forms.</h3>
              <div className="up-rot" aria-live="polite">
                {PHRASES.map((text, i) => (
                  <p
                    key={text}
                    className={`up-rotp${(reduceMotion ? i === 0 : i === idx) ? ' is-active' : ''}`}
                  >
                    {text}
                  </p>
                ))}
              </div>
              <p className="rowp closing" style={{ marginTop: '10px' }}>
                Whatever you choose, you get real local knowledge.
              </p>
              <p className="rowp closing">
                If we see potential in an opportunity, you&apos;ll hear it from us. If we don&apos;t, you&apos;ll
                hear that too.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="sell-with-us"
        className="sec"
        data-cms-page="services"
        data-cms-section="sell_offer"
        aria-labelledby="sell-with-us-heading"
      >
        <div className="two up-services__shell">
          <div className="stick">
            <span className="lbl">02 &nbsp;Sell with us</span>
            <CmsText
              page="services"
              section="sell_offer"
              field="lead"
              as="h2"
              id="sell-with-us-heading"
              className="h2 one"
            >
              {get('services', 'sell_offer', 'lead', 'Not just sold. Sold right.')}
            </CmsText>
            <CmsText page="services" section="sell_offer" field="support" as="p" className="lead">
              {get(
                'services',
                'sell_offer',
                'support',
                "Your property deserves more than a listing. Here's how we sell it.",
              )}
            </CmsText>
          </div>
          <CmsText page="services" section="sell_offer" field="support" as="p" className="lead-m">
            {get(
              'services',
              'sell_offer',
              'support',
              "Your property deserves more than a listing. Here's how we sell it.",
            )}
          </CmsText>
          <div className="paper">
            {sellRows.map((row) => (
              <div className="row" key={row.key}>
                <CmsText
                  page="services"
                  section="sell_offer"
                  field={`${row.key}_title`}
                  as="h3"
                  className="rowt"
                >
                  {row.title}
                </CmsText>
                <CmsText
                  page="services"
                  section="sell_offer"
                  field={`${row.key}_body`}
                  as="p"
                  className="rowp"
                >
                  {row.body}
                </CmsText>
              </div>
            ))}
            <div className="row">
              <CmsText
                page="services"
                section="sell_offer"
                field="completion_title"
                as="h3"
                className="rowt"
              >
                {get('services', 'sell_offer', 'completion_title', 'With you until completion')}
              </CmsText>
              <CmsText
                page="services"
                section="sell_offer"
                field="completion_body"
                as="p"
                className="rowp"
              >
                {get('services', 'sell_offer', 'completion_body', 'We guide you through every step of the sale.')}
              </CmsText>
              <p className="rowp">
                <span className="legal-em">
                  {get('services', 'sell_offer', 'legal_label', 'Legal support')},{' '}
                  {String(get('services', 'sell_offer', 'legal_badge', 'On request')).toLowerCase()}.
                </span>{' '}
                {get(
                  'services',
                  'sell_offer',
                  'legal_body',
                  'An additional service from our trusted legal partners, guiding your deal to a safe and successful close.',
                )}
              </p>
            </div>
            <div className="after">
              <CmsText page="services" section="sell_offer" field="cta_heading" as="h3">
                {get('services', 'sell_offer', 'cta_heading', 'Tell us about your property.')}
              </CmsText>
              <CmsText page="services" section="sell_offer" field="cta_body" as="p" className="rowp">
                {get(
                  'services',
                  'sell_offer',
                  'cta_body',
                  'We choose potential over volume. Let us review your property and give you an honest view of its potential and its price.',
                )}
              </CmsText>
            </div>
          </div>
        </div>
      </section>

      <section
        id="property-management"
        className="sec sec--manage"
        data-cms-page="services"
        data-cms-section="property_mgmt"
        aria-labelledby="property-management-heading"
      >
        <div className="two up-services__shell">
          <div className="stick">
            <span className="lbl">03 &nbsp;Property management</span>
            <CmsText
              page="services"
              section="property_mgmt"
              field="lead"
              as="h2"
              id="property-management-heading"
              className="h2"
            >
              {get('services', 'property_mgmt', 'lead', 'Let your property work for you.')}
            </CmsText>
            <CmsText page="services" section="property_mgmt" field="tagline" as="p" className="lead">
              {get('services', 'property_mgmt', 'tagline', 'Two plans. One standard of care.')}
            </CmsText>
          </div>
          <CmsText page="services" section="property_mgmt" field="tagline" as="p" className="lead-m">
            {get('services', 'property_mgmt', 'tagline', 'Two plans. One standard of care.')}
          </CmsText>
          <div className="paper">
            <div className="tbl">
              <span className="vline" aria-hidden />
              <div className="tbl-grid tbl-grid--head">
                <span />
                <div className="tbl-plan">
                  <CmsText page="services" section="property_mgmt" field="placement_title" as="span" className="pn2">
                    {get('services', 'property_mgmt', 'placement_title', 'Rental placement')}
                  </CmsText>
                  <CmsText
                    page="services"
                    section="property_mgmt"
                    field="placement_tagline"
                    as="span"
                    className="tbl-note"
                  >
                    {get('services', 'property_mgmt', 'placement_tagline', 'Your terms. Our network.')}
                  </CmsText>
                </div>
                <div className="tbl-plan">
                  <CmsText page="services" section="property_mgmt" field="full_title" as="span" className="pn2">
                    {get('services', 'property_mgmt', 'full_title', 'Full property management')}
                  </CmsText>
                  <CmsText page="services" section="property_mgmt" field="full_tagline" as="span" className="tbl-note">
                    {get('services', 'property_mgmt', 'full_tagline', 'You own it. We run it.')}
                  </CmsText>
                </div>
              </div>
              <div className="tbl-grid tbl-grid--best">
                <span className="tbl-best">{get('services', 'property_mgmt', 'best_label', 'Best for')}</span>
                <CmsText
                  page="services"
                  section="property_mgmt"
                  field="placement_best"
                  as="span"
                  className="tbl-cell"
                >
                  {get('services', 'property_mgmt', 'placement_best', 'Active ownership')}
                </CmsText>
                <CmsText page="services" section="property_mgmt" field="full_best" as="span" className="tbl-cell">
                  {get('services', 'property_mgmt', 'full_best', 'Hands-free ownership')}
                </CmsText>
              </div>
              {PM_FEATURES.map((feature) => (
                <div
                  key={feature.key}
                  className={`tbl-grid${feature.accent ? ' tbl-grid--accent' : ''}`}
                >
                  <CmsText
                    page="services"
                    section="property_mgmt"
                    field={`${feature.key}_label`}
                    as="span"
                    className="tbl-label"
                  >
                    {get('services', 'property_mgmt', `${feature.key}_label`, feature.label)}
                  </CmsText>
                  <span className={`tbl-mark${feature.placement ? '' : ' tbl-mark--no'}`} aria-hidden>
                    {feature.placement ? '✔' : '—'}
                  </span>
                  <span className="tbl-mark" aria-hidden>
                    {feature.full ? '✔' : '—'}
                  </span>
                </div>
              ))}
            </div>
            <div className="after after--tight">
              <CmsText page="services" section="property_mgmt" field="cta_heading" as="h3">
                {get('services', 'property_mgmt', 'cta_heading', 'Not sure which plan fits?')}
              </CmsText>
              <CmsText page="services" section="property_mgmt" field="cta_body" as="p" className="rowp">
                {get(
                  'services',
                  'property_mgmt',
                  'cta_body',
                  "Tell us about your property, and we'll recommend the right one.",
                )}
              </CmsText>
            </div>
          </div>
        </div>
      </section>

      <section className="up-contact" data-cms-page="services" data-cms-section="cta">
        <div className="up-services__shell up-contact__inner">
          <div className="up-contact__copy">
            <CmsText page="services" section="cta" field="heading" as="h2" className="h2">
              {ctaHeading}
            </CmsText>
            <CmsText page="services" section="cta" field="description" as="p" className="lead">
              {ctaDescription}
            </CmsText>
          </div>
        </div>
      </section>
    </div>
  )
}

export default UnitedServices
