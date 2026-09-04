import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import CTASection from '../components/CTASection/CTASection'
import { useSiteContent } from '../hooks/useSiteContent'
import './SellWithUs.css'

const MotionLink = motion.create(Link)

const heroItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
}

const staggerWrap = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.08 },
  },
}

function SellWithUs() {
  const reduceMotion = useReducedMotion()
  const { get } = useSiteContent()

  const PROCESS_STEPS = [
    {
      title: get('sell', 'process', 'step1_title', 'Step 1 — Discovery Consultation'),
      body: get(
        'sell',
        'process',
        'step1_body',
        'We start with a conversation, not a valuation. We learn about your property, your timeline, your expectations — and we build a strategy around you.',
      ),
    },
    {
      title: get('sell', 'process', 'step2_title', 'Step 2 — Bespoke Property Valuation'),
      body: get(
        'sell',
        'process',
        'step2_body',
        "Our valuation is not pulled from a database. It's built on deep local knowledge of Limassol's market, recent transactions, and your property's unique attributes.",
      ),
    },
    {
      title: get('sell', 'process', 'step3_title', 'Step 3 — Tailored Marketing Plan'),
      body: get(
        'sell',
        'process',
        'step3_body',
        'Every property gets a custom marketing plan — professional photography, cinematic video, targeted digital campaigns, and access to our private network of buyers and investors.',
      ),
    },
    {
      title: get('sell', 'process', 'step4_title', 'Step 4 — Curated Buyer Matching'),
      body: get(
        'sell',
        'process',
        'step4_body',
        "We don't blast your listing to everyone. We match it to the right buyers from our network — qualified, serious, and aligned with your property's value.",
      ),
    },
    {
      title: get('sell', 'process', 'step5_title', 'Step 5 — Negotiation & Advisory'),
      body: get(
        'sell',
        'process',
        'step5_body',
        'We negotiate on your behalf with full transparency. You are informed at every step, never left guessing.',
      ),
    },
    {
      title: get('sell', 'process', 'step6_title', 'Step 6 — Seamless Closing'),
      body: get(
        'sell',
        'process',
        'step6_body',
        "From legal coordination with our trusted partners to final handover — we manage every detail so you don't have to.",
      ),
    },
  ]

  const WHY_POINTS = [
    {
      label: get('sell', 'why', 'point1_title', 'Boutique attention'),
      body: get(
        'sell',
        'why',
        'point1_body',
        'We work with a select number of sellers at a time, so your property always comes first',
      ),
    },
    {
      label: get('sell', 'why', 'point2_title', 'Bespoke strategy'),
      body: get(
        'sell',
        'why',
        'point2_body',
        'No template. Every sale is planned and executed around your specific goals',
      ),
    },
    {
      label: get('sell', 'why', 'point3_title', 'All-in-one support'),
      body: get(
        'sell',
        'why',
        'point3_body',
        'Legal, marketing, negotiation, and aftercare united under one roof',
      ),
    },
    {
      label: get('sell', 'why', 'point4_title', 'Local expertise'),
      body: get('sell', 'why', 'point4_body', "Deep knowledge of Limassol's luxury and residential market"),
    },
    {
      label: get('sell', 'why', 'point5_title', 'MBA-level advisory'),
      body: get(
        'sell',
        'why',
        'point5_body',
        'Data-informed decisions, investment thinking, and honest guidance',
      ),
    },
  ]

  const SOCIAL_PROOF_POINTS = [
    get('sell', 'proof', 'bullet1', 'Proven track record in Cyprus market'),
    get('sell', 'proof', 'bullet2', 'Successful investment outcomes, many happy clients'),
  ]

  const COMPARE_ROWS = [
    {
      traditional: get('sell', 'compare', 'row1_traditional', 'Volume-focused'),
      united: get('sell', 'compare', 'row1_united', 'Relationship-focused'),
    },
    {
      traditional: get('sell', 'compare', 'row2_traditional', 'Standard listing'),
      united: get('sell', 'compare', 'row2_united', 'Bespoke strategy'),
    },
    {
      traditional: get('sell', 'compare', 'row3_traditional', 'You wait for calls'),
      united: get('sell', 'compare', 'row3_united', 'We keep you informed'),
    },
    {
      traditional: get('sell', 'compare', 'row4_traditional', 'Generic marketing'),
      united: get('sell', 'compare', 'row4_united', 'Cinematic, tailored campaigns'),
    },
    {
      traditional: get('sell', 'compare', 'row5_traditional', 'Commission-only mindset'),
      united: get('sell', 'compare', 'row5_united', 'Outcome-driven advisory'),
    },
  ]

  const heroPrimaryHover = reduceMotion
    ? undefined
    : {
        y: -5,
        scale: 1.025,
        boxShadow: '0 14px 40px rgba(191, 152, 117, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        transition: { type: 'spring', stiffness: 420, damping: 28 },
      }

  const heroGhostHover = reduceMotion
    ? undefined
    : {
        y: -4,
        scale: 1.02,
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
        borderColor: 'rgba(255, 255, 255, 0.72)',
        transition: { type: 'spring', stiffness: 380, damping: 30 },
      }

  const heroBtnTap = reduceMotion ? undefined : { scale: 0.97 }

  return (
    <>
      <Helmet>
        <title>Sell With Us | United Properties</title>
        <meta
          name="description"
          content="Sell with confidence in Cyprus. United Properties offers boutique attention, bespoke marketing, and MBA-level advisory for luxury and residential sales in Limassol."
        />
      </Helmet>

      <section
        className="page-hero sell-with-us__hero"
        data-cms-page="sell"
        data-cms-section="hero"
      >
        <div className="sell-with-us__hero-ambient" aria-hidden="true">
          <span className="sell-with-us__hero-orb sell-with-us__hero-orb--a" />
          <span className="sell-with-us__hero-orb sell-with-us__hero-orb--b" />
          <span className="sell-with-us__hero-shimmer" />
        </div>
        <motion.div
          className="container sell-with-us__hero-inner"
          variants={staggerWrap}
          initial="hidden"
          animate="visible"
        >
          <motion.p className="sell-with-us__hero-kicker" variants={heroItem}>
            {get('sell', 'hero', 'eyebrow', 'United Services')}
          </motion.p>
          <motion.h1 className="sell-with-us__hero-headline" variants={heroItem}>
            {get('sell', 'hero', 'heading', 'Sell With Confidence. Sell With United.')}
          </motion.h1>
          <motion.p className="sell-with-us__hero-sub" variants={heroItem}>
            {get(
              'sell',
              'hero',
              'description',
              'A boutique agency. A bespoke process. Your property deserves more than a listing — it deserves a strategy.',
            )}
          </motion.p>
          <motion.div className="sell-with-us__hero-cta" variants={heroItem}>
            <MotionLink
              to="/contact"
              className="btn btn-gold sell-with-us__hero-btn-primary"
              whileHover={heroPrimaryHover}
              whileTap={heroBtnTap}
            >
              <span className="sell-with-us__hero-btn-label">
                {get('sell', 'hero', 'cta_primary', 'Book a Valuation Call')}
              </span>
            </MotionLink>
            <MotionLink
              to="/services"
              className="btn btn-outline-light sell-with-us__hero-btn-ghost"
              whileHover={heroGhostHover}
              whileTap={heroBtnTap}
            >
              {get('sell', 'hero', 'cta_secondary', 'Explore all services')}
            </MotionLink>
          </motion.div>
        </motion.div>
      </section>

      <section
        className="section section--alt sell-with-us__problem"
        aria-labelledby="sell-problem-heading"
        data-cms-page="sell"
        data-cms-section="problem"
      >
        <div className="sell-with-us__problem-shell container container--narrow">
          <motion.span
            className="sell-with-us__section-label"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.5 }}
          >
            {get('sell', 'problem', 'label', 'Section 1 — The problem')}{' '}
            <span className="sell-with-us__section-label-note">
              {get('sell', 'problem', 'label_note', '(StoryBrand hook)')}
            </span>
          </motion.span>
          <motion.h2
            id="sell-problem-heading"
            className="sell-with-us__section-title sell-with-us__section-title--accent-line"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.55, delay: 0.05 }}
          >
            {get('sell', 'problem', 'heading', 'The problem')}
          </motion.h2>
          <motion.p
            className="sell-with-us__problem-lead"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            {get('sell', 'problem', 'lead', "Speak directly to the client's frustration:")}
          </motion.p>
          <motion.div
            className="sell-with-us__problem-quote"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.58, delay: 0.1 }}
          >
            <p className="sell-with-us__problem-copy">
              {get(
                'sell',
                'problem',
                'body',
                'Most sellers are handed a sign, listed on a portal, and left waiting. No strategy. No updates. No real guidance. At United Properties, we do things differently.',
              )}
            </p>
          </motion.div>
        </div>
      </section>

      <section
        className="section section--light sell-with-us__process"
        aria-labelledby="sell-process-heading"
        data-cms-page="sell"
        data-cms-section="process"
      >
        <div className="container">
          <motion.header
            className="sell-with-us__process-intro"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
          >
            <p className="sell-with-us__section-label sell-with-us__section-label--ink">
              {get('sell', 'process', 'label', 'Section 2 — Our bespoke selling process')}{' '}
              <span className="sell-with-us__section-label-note">
                {get('sell', 'process', 'label_note', '(step by step)')}
              </span>
            </p>
            <h2 id="sell-process-heading">
              {get('sell', 'process', 'heading', 'Our bespoke selling process')}
            </h2>
            <p className="sell-with-us__process-lead">
              {get(
                'sell',
                'process',
                'lead',
                'This is your core differentiator. Show the journey, not just the outcome.',
              )}
            </p>
          </motion.header>
          <ol className="sell-with-us__steps">
            {PROCESS_STEPS.map((step, index) => (
              <motion.li
                key={step.title}
                className="sell-with-us__step-card card-luxury"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8%', amount: 0.12 }}
                transition={{ duration: 0.52, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.28 } }}
              >
                <span className="sell-with-us__step-glow" aria-hidden />
                <span className="sell-with-us__step-num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="sell-with-us__step-title">{step.title}</h3>
                <p className="sell-with-us__step-body">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="section section--alt sell-with-us__why"
        aria-labelledby="sell-why-heading"
        data-cms-page="sell"
        data-cms-section="why"
      >
        <div className="container">
          <motion.header
            className="sell-with-us__process-intro sell-with-us__process-intro--alt"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.52 }}
          >
            <p className="sell-with-us__section-label sell-with-us__section-label--dim">
              {get('sell', 'why', 'label', 'Section 3 — Why United Properties')}
            </p>
            <h2 id="sell-why-heading">{get('sell', 'why', 'heading', 'Why United Properties')}</h2>
            <p className="sell-with-us__why-intro">
              {get('sell', 'why', 'intro', 'Built around your real differentiators:')}
            </p>
          </motion.header>
          <ul className="sell-with-us__why-grid">
            {WHY_POINTS.map((item, i) => (
              <motion.li
                key={item.label}
                className="sell-with-us__why-item card-luxury"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={
                  reduceMotion
                    ? { duration: 0.45, delay: i * 0.05 }
                    : { type: 'spring', stiffness: 400, damping: 34, delay: i * 0.06 }
                }
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -6, transition: { type: 'spring', stiffness: 440, damping: 28 } }
                }
              >
                <span className="sell-with-us__why-marker" aria-hidden />
                <strong className="sell-with-us__why-title">{item.label}</strong>
                <p className="sell-with-us__why-copy">{item.body}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="section section--light sell-with-us__proof"
        aria-labelledby="sell-proof-heading"
        data-cms-page="sell"
        data-cms-section="proof"
      >
        <div className="container">
          <motion.header
            className="sell-with-us__process-intro"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.52 }}
          >
            <p className="sell-with-us__section-label sell-with-us__section-label--ink">
              {get('sell', 'proof', 'label', 'Section 4 — Social proof')}
            </p>
            <h2 id="sell-proof-heading">{get('sell', 'proof', 'heading', 'Social proof')}</h2>
            <p className="sell-with-us__proof-lead">
              {get(
                'sell',
                'proof',
                'lead',
                "We don't measure success in listings. We measure it in results — and relationships.",
              )}
            </p>
          </motion.header>
          <motion.ul
            className="sell-with-us__proof-bullets"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            {SOCIAL_PROOF_POINTS.map((text) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                {text}
              </motion.li>
            ))}
          </motion.ul>
          <motion.p
            className="sell-with-us__testimonials-placeholder-note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            {get('sell', 'proof', 'placeholder_note', 'Placeholder for 2–3 testimonials once collected.')}
          </motion.p>
          <div className="sell-with-us__testimonials">
            <motion.blockquote
              className="sell-with-us__testimonial card-luxury"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48 }}
              whileHover={{ y: -4 }}
            >
              <p>{get('sell', 'proof', 'testimonial1', 'Client testimonial — to be added.')}</p>
            </motion.blockquote>
            <motion.blockquote
              className="sell-with-us__testimonial card-luxury"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, delay: 0.06 }}
              whileHover={{ y: -4 }}
            >
              <p>{get('sell', 'proof', 'testimonial2', 'Client testimonial — to be added.')}</p>
            </motion.blockquote>
          </div>
        </div>
      </section>

      <section
        className="section section--alt sell-with-us__compare"
        aria-labelledby="sell-compare-heading"
        data-cms-page="sell"
        data-cms-section="compare"
      >
        <div className="container">
          <motion.header
            className="sell-with-us__process-intro sell-with-us__process-intro--alt sell-with-us__compare-intro"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.52 }}
          >
            <p className="sell-with-us__section-label sell-with-us__section-label--dim">
              {get('sell', 'compare', 'label', 'Section 5 — The United difference')}{' '}
              <span className="sell-with-us__section-label-note">
                {get('sell', 'compare', 'label_note', '(United vs. traditional)')}
              </span>
            </p>
            <h2 id="sell-compare-heading">
              {get('sell', 'compare', 'heading', 'United vs. traditional')}
            </h2>
            <p className="sell-with-us__compare-lead">
              {get('sell', 'compare', 'lead', 'A simple visual contrast:')}
            </p>
          </motion.header>
          <motion.div
            className="sell-with-us__compare-table"
            role="table"
            aria-label="Traditional agency compared to United Properties"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.58 }}
          >
            <div className="sell-with-us__compare-row sell-with-us__compare-row--head" role="row">
              <div role="columnheader">
                {get('sell', 'compare', 'col_traditional', 'Traditional Agency')}
              </div>
              <div role="columnheader">
                {get('sell', 'compare', 'col_united', 'United Properties')}
              </div>
            </div>
            {COMPARE_ROWS.map((row, ri) => (
              <motion.div
                key={row.traditional}
                className="sell-with-us__compare-row"
                role="row"
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.42, delay: ri * 0.05 }}
              >
                <div role="cell">{row.traditional}</div>
                <div role="cell">{row.united}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CTASection
        title={get('sell', 'cta', 'heading', 'Ready to talk strategy?')}
        description={get(
          'sell',
          'cta',
          'description',
          'Book a valuation call with our team — confidential, structured, and tailored to your property.',
        )}
        cmsPage="sell"
        cmsSection="cta"
      />
    </>
  )
}

export default SellWithUs
