import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import CmsText from '../components/CmsPreview/CmsText'
import { useSiteContent } from '../hooks/useSiteContent'
import './About.css'

const HEADING_WORDS = ['Behind', 'every', 'move', 'is', 'a', 'story.']

const COPY = {
  eyebrow: 'About',
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
  process:
    "That's why every move we make is built the same way: research first, a fair price, and professional presentation, with clear numbers behind every decision.",
  closing:
    'The day you decide should feel like the first day of something new, the day inspiration becomes your future.',
  company: 'PKM United Properties Ltd',
  licence: 'Licensed real estate agent  ·  Reg. No. 1393  ·  Lic. No. 703/E',
}

function useNavbarOffset() {
  const [top, setTop] = useState(0)

  useEffect(() => {
    function measure() {
      const nav = document.querySelector('header.navbar')
      const next = nav ? Math.round(nav.getBoundingClientRect().height) : 0
      setTop((prev) => (prev === next ? prev : next))
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [])

  return top
}

function About() {
  const { get } = useSiteContent()
  const topOffset = useNavbarOffset()
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const headingRaw = get('about', 'manifesto', 'heading', COPY.heading)
  const headingTrimmed = String(headingRaw || '').trim()
  const displayHeading = headingTrimmed || COPY.heading
  const useAnimatedHeading =
    /^behind\s+every\s+move\s+is\s+a\s+story\.?$/i.test(displayHeading)

  const processRaw = get('about', 'manifesto', 'process', COPY.process)
  const processText = /honest advice|real local knowledge/i.test(String(processRaw || ''))
    ? COPY.process
    : processRaw

  const closingRaw = get('about', 'manifesto', 'closing', COPY.closing)
  const closingText =
    String(closingRaw || '').trim() === 'The day you decide should feel like the first day of something new.'
      ? COPY.closing
      : closingRaw

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

      <div className="up-about" style={{ '--up-top': `${topOffset}px` }}>
        <section
          className="up-about__intro"
          data-cms-page="about"
          data-cms-section="manifesto"
          aria-labelledby="about-manifesto-heading"
        >
          <div className="up-about__shell up-about__intro-inner">
            <CmsText page="about" section="manifesto" field="eyebrow" as="span" className="lbl">
              {get('about', 'manifesto', 'eyebrow', COPY.eyebrow)}
            </CmsText>

            {useAnimatedHeading && !reduceMotion ? (
              <h1
                className="intro-title"
                id="about-manifesto-heading"
                aria-label={displayHeading}
              >
                {HEADING_WORDS.map((word, i) => (
                  <span key={word} className="bw" style={{ animationDelay: `${0.05 + i * 0.1}s` }}>
                    {word}
                  </span>
                ))}
              </h1>
            ) : (
              <CmsText
                page="about"
                section="manifesto"
                field="heading"
                as="h1"
                id="about-manifesto-heading"
                className="intro-title"
              >
                {displayHeading}
              </CmsText>
            )}

            <CmsText page="about" section="manifesto" field="opening" as="p" className="lead">
              {get('about', 'manifesto', 'opening', COPY.opening)}
            </CmsText>
          </div>
        </section>

        <section className="up-about__letter" data-cms-page="about" data-cms-section="manifesto">
          <div className="sheet">
            <div className="fold fold--a" aria-hidden />
            <div className="fold fold--b" aria-hidden />
            <div className="ltr">
              <CmsText page="about" section="manifesto" field="bridge" as="p">
                {get('about', 'manifesto', 'bridge', COPY.bridge)}
              </CmsText>
              <CmsText page="about" section="manifesto" field="intro" as="p">
                {get('about', 'manifesto', 'intro', COPY.intro)}
              </CmsText>
              <CmsText page="about" section="manifesto" field="founding" as="p" className="strong">
                {get('about', 'manifesto', 'founding', COPY.founding)}
              </CmsText>
              <CmsText page="about" section="manifesto" field="selection" as="p">
                {get('about', 'manifesto', 'selection', COPY.selection)}
              </CmsText>
              <CmsText page="about" section="manifesto" field="process" as="p">
                {processText}
              </CmsText>
              <CmsText page="about" section="manifesto" field="closing" as="p">
                {closingText}
              </CmsText>

              <hr className="ltr-rule" />

              <div className="cred">
                <CmsText page="about" section="manifesto" field="company" as="span" className="cn">
                  {get('about', 'manifesto', 'company', COPY.company)}
                </CmsText>
                <CmsText page="about" section="manifesto" field="licence" as="span" className="cl">
                  {get('about', 'manifesto', 'licence', COPY.licence)}
                </CmsText>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default About
