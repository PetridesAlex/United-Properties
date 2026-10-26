import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import CmsText from '../components/CmsPreview/CmsText'
import CmsStaggeredHeading from '../components/StaggeredText/CmsStaggeredHeading'
import { useSiteContent } from '../hooks/useSiteContent'
import './About.css'

const COPY = {
  heading: 'Behind every move is a story.',
  opening:
    'A smart investment. A first home. A fresh start in a new city. A family finally with room to grow.',
  bridge:
    'Every property decision begins with inspiration. It deserves someone who protects it.',
  intro:
    "I'm Panagiotis, born and raised in Limassol. Since 2019, I've worked this market through its strong years and its slower ones, and I've learned what people are really looking for. It isn't a listing. It's the moment a place stops being an address and starts being your future.",
  founding: 'I started United Properties for that moment.',
  selection:
    'Every property we present is chosen because we believe in its potential, never to add one more listing to the window.',
  promiseLead: 'Honest advice. Real local knowledge.',
  promiseClose: 'So you decide with excitement and confidence, never doubt.',
  closing: 'The day you decide should feel like the first day of something new.',
  signature: 'Confidence in every move.',
  cta: 'Start a conversation',
}

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

function About() {
  const { get } = useSiteContent()
  const reduceMotion = useReducedMotion()

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
            'Behind every move is a story. Meet Panagiotis and the idea behind United Properties in Limassol.',
          )}
        />
      </Helmet>

      <section
        className="about-manifesto"
        data-cms-page="about"
        data-cms-section="manifesto"
        aria-labelledby="about-manifesto-heading"
      >
        <div className="about-manifesto__ambient" aria-hidden />
        <div className="about-manifesto__veil" aria-hidden />
        <span className="about-manifesto__orb about-manifesto__orb--a" aria-hidden />
        <span className="about-manifesto__orb about-manifesto__orb--b" aria-hidden />

        <div className="about-manifesto__shell">
          <motion.article
            className="about-manifesto__card"
            variants={reduceMotion ? undefined : stagger}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
          >
            <span className="about-manifesto__accent" aria-hidden />

            <motion.div variants={reduceMotion ? undefined : reveal}>
              <CmsStaggeredHeading
                page="about"
                section="manifesto"
                field="heading"
                as="h1"
                id="about-manifesto-heading"
                className="about-manifesto__heading"
                text={get('about', 'manifesto', 'heading', COPY.heading)}
              />
            </motion.div>

            <motion.div className="about-manifesto__body" variants={reduceMotion ? undefined : stagger}>
              <motion.p className="about-manifesto__p about-manifesto__p--lead" variants={reduceMotion ? undefined : reveal}>
                <CmsText page="about" section="manifesto" field="opening" as="span">
                  {get('about', 'manifesto', 'opening', COPY.opening)}
                </CmsText>
              </motion.p>

              <motion.p className="about-manifesto__p" variants={reduceMotion ? undefined : reveal}>
                <CmsText page="about" section="manifesto" field="bridge" as="span">
                  {get('about', 'manifesto', 'bridge', COPY.bridge)}
                </CmsText>
              </motion.p>

              <motion.p className="about-manifesto__p" variants={reduceMotion ? undefined : reveal}>
                <CmsText page="about" section="manifesto" field="intro" as="span">
                  {get('about', 'manifesto', 'intro', COPY.intro)}
                </CmsText>
              </motion.p>

              <motion.p className="about-manifesto__p about-manifesto__p--emphasis" variants={reduceMotion ? undefined : reveal}>
                <CmsText page="about" section="manifesto" field="founding" as="span">
                  {get('about', 'manifesto', 'founding', COPY.founding)}
                </CmsText>
              </motion.p>

              <motion.p className="about-manifesto__p" variants={reduceMotion ? undefined : reveal}>
                <CmsText page="about" section="manifesto" field="selection" as="span">
                  {get('about', 'manifesto', 'selection', COPY.selection)}
                </CmsText>
              </motion.p>

              <motion.p className="about-manifesto__p about-manifesto__p--promise" variants={reduceMotion ? undefined : reveal}>
                <CmsText page="about" section="manifesto" field="promise_lead" as="span">
                  {get('about', 'manifesto', 'promise_lead', COPY.promiseLead)}
                </CmsText>
                <br />
                <CmsText page="about" section="manifesto" field="promise_close" as="span">
                  {get('about', 'manifesto', 'promise_close', COPY.promiseClose)}
                </CmsText>
              </motion.p>

              <motion.p className="about-manifesto__p" variants={reduceMotion ? undefined : reveal}>
                <CmsText page="about" section="manifesto" field="closing" as="span">
                  {get('about', 'manifesto', 'closing', COPY.closing)}
                </CmsText>
              </motion.p>

              <motion.p className="about-manifesto__signature" variants={reduceMotion ? undefined : reveal}>
                <CmsText page="about" section="manifesto" field="signature" as="span">
                  {get('about', 'manifesto', 'signature', COPY.signature)}
                </CmsText>
              </motion.p>
            </motion.div>

            <motion.div
              className="about-manifesto__cta-wrap"
              variants={reduceMotion ? undefined : reveal}
              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              <Link to="/contact" className="about-manifesto__cta">
                <span className="about-manifesto__cta-glow" aria-hidden />
                <span className="about-manifesto__cta-sheen" aria-hidden />
                <CmsText
                  page="about"
                  section="manifesto"
                  field="cta_label"
                  as="span"
                  className="about-manifesto__cta-label"
                >
                  {get('about', 'manifesto', 'cta_label', COPY.cta)}
                </CmsText>
                <span className="about-manifesto__cta-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </motion.div>
          </motion.article>
        </div>
      </section>
    </>
  )
}

export default About
