import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import CmsText from '../components/CmsPreview/CmsText'
import CmsStaggeredHeading from '../components/StaggeredText/CmsStaggeredHeading'
import { useSiteContent } from '../hooks/useSiteContent'
import './About.css'

const BEAT_DEFAULTS = [
  'A smart investment.',
  'A first home.',
  'A fresh start in a new city.',
  'A family finally with room to grow.',
]

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
}

function About() {
  const { get } = useSiteContent()
  const reduceMotion = useReducedMotion()

  const beats = BEAT_DEFAULTS.map((fallback, index) =>
    get('about', 'manifesto', `beat${index + 1}`, fallback),
  )
  const profilePhoto = String(get('about', 'manifesto', 'profile_photo', '') || '').trim()

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
            className="about-manifesto__article"
            variants={reduceMotion ? undefined : stagger}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
          >
            <motion.div className="about-manifesto__lead" variants={reduceMotion ? undefined : reveal}>
              <CmsText
                page="about"
                section="manifesto"
                field="eyebrow"
                as="p"
                className="about-manifesto__eyebrow"
              >
                {get('about', 'manifesto', 'eyebrow', 'About')}
              </CmsText>
              <CmsStaggeredHeading
                page="about"
                section="manifesto"
                field="heading"
                as="h1"
                id="about-manifesto-heading"
                className="about-manifesto__heading"
                text={get('about', 'manifesto', 'heading', 'Behind every move is a story.')}
              />

              <motion.ul
                className="about-manifesto__beats"
                variants={reduceMotion ? undefined : stagger}
                aria-label="The stories behind a move"
              >
                {beats.map((beat, index) => (
                  <motion.li
                    key={`${beat}-${index}`}
                    className="about-manifesto__beat"
                    variants={reduceMotion ? undefined : reveal}
                    whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  >
                    <span className="about-manifesto__beat-index" aria-hidden>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <CmsText
                      page="about"
                      section="manifesto"
                      field={`beat${index + 1}`}
                      as="span"
                      className="about-manifesto__beat-text"
                    >
                      {beat}
                    </CmsText>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.p className="about-manifesto__bridge" variants={reduceMotion ? undefined : reveal}>
                <span className="about-manifesto__bridge-sheen" aria-hidden />
                <CmsText page="about" section="manifesto" field="bridge" as="span">
                  {get(
                    'about',
                    'manifesto',
                    'bridge',
                    'Every property decision begins with inspiration. It deserves someone who protects it.',
                  )}
                </CmsText>
              </motion.p>
            </motion.div>

            <motion.div className="about-manifesto__narrative" variants={reduceMotion ? undefined : reveal}>
              <div className="about-manifesto__story">
                <div className="about-manifesto__identity">
                  <div className="about-manifesto__avatar" aria-hidden>
                    <span className="about-manifesto__avatar-ring" />
                    {profilePhoto ? (
                      <img
                        className="about-manifesto__avatar-photo"
                        src={profilePhoto}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="about-manifesto__avatar-initials">
                        {get('about', 'manifesto', 'profile_initials', 'P')}
                      </span>
                    )}
                  </div>
                  <div className="about-manifesto__identity-copy">
                    <CmsText
                      page="about"
                      section="manifesto"
                      field="profile_name"
                      as="p"
                      className="about-manifesto__identity-name"
                    >
                      {get('about', 'manifesto', 'profile_name', 'Panagiotis')}
                    </CmsText>
                    <CmsText
                      page="about"
                      section="manifesto"
                      field="profile_role"
                      as="p"
                      className="about-manifesto__identity-role"
                    >
                      {get('about', 'manifesto', 'profile_role', 'Founder, United Properties')}
                    </CmsText>
                    <CmsText
                      page="about"
                      section="manifesto"
                      field="profile_meta"
                      as="p"
                      className="about-manifesto__identity-meta"
                    >
                      {get('about', 'manifesto', 'profile_meta', 'Limassol · Since 2019')}
                    </CmsText>
                  </div>
                </div>

                <div className="about-manifesto__details">
                  <CmsText page="about" section="manifesto" field="intro" as="p" className="about-manifesto__p">
                    {get(
                      'about',
                      'manifesto',
                      'intro',
                      "I'm Panagiotis, born and raised in Limassol. Since 2019, I've worked this market through its strong years and its slower ones, and I've learned what people are really looking for.",
                    )}
                  </CmsText>
                  <CmsText
                    page="about"
                    section="manifesto"
                    field="insight"
                    as="p"
                    className="about-manifesto__insight"
                  >
                    {get(
                      'about',
                      'manifesto',
                      'insight',
                      "It isn't a listing. It's the moment a place stops being an address and starts being your future.",
                    )}
                  </CmsText>
                  <CmsText page="about" section="manifesto" field="founding" as="p" className="about-manifesto__p">
                    {get(
                      'about',
                      'manifesto',
                      'founding',
                      'I started United Properties for that moment. Every property we present is chosen because we believe in its potential, never to add one more listing to the window.',
                    )}
                  </CmsText>
                  <CmsText page="about" section="manifesto" field="promise" as="p" className="about-manifesto__p about-manifesto__p--emphasis">
                    {get(
                      'about',
                      'manifesto',
                      'promise',
                      'Honest advice. Real local knowledge. So you decide with excitement and confidence, never doubt.',
                    )}
                  </CmsText>
                </div>
              </div>

              <footer className="about-manifesto__close">
                <span className="about-manifesto__close-rule" aria-hidden />
                <CmsText
                  page="about"
                  section="manifesto"
                  field="closing"
                  as="p"
                  className="about-manifesto__closing"
                >
                  {get(
                    'about',
                    'manifesto',
                    'closing',
                    'The day you decide should feel like the first day of something new.',
                  )}
                </CmsText>
                <CmsText
                  page="about"
                  section="manifesto"
                  field="signature"
                  as="p"
                  className="about-manifesto__signature"
                >
                  {get('about', 'manifesto', 'signature', 'Confidence in every move.')}
                </CmsText>

                <motion.div
                  className="about-manifesto__cta-wrap"
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
                      {get('about', 'manifesto', 'cta_label', 'Start a conversation')}
                    </CmsText>
                    <span className="about-manifesto__cta-arrow" aria-hidden>
                      →
                    </span>
                  </Link>
                </motion.div>
              </footer>
            </motion.div>
          </motion.article>
        </div>
      </section>
    </>
  )
}

export default About
