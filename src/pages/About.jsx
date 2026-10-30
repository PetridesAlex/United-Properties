import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useSiteContent } from '../hooks/useSiteContent'
import './About.css'

const HEADING_WORDS = ['A', 'boutique', 'real', 'estate', 'agency,', 'born', 'in', 'Limassol.']

const COPY = {
  eyebrow: 'About',
  heading: 'A boutique real estate agency, born in Limassol.',
  opener:
    'Behind every property decision there is a story, and every move begins with inspiration and confidence.',
  intro:
    "I'm Panagiotis, born and raised in Limassol. Since 2019 I've experienced this market through its strong years, and its slower ones. I've learned what people are really looking for. It isn't a listing. It's the moment a place stops being an address and becomes your future.",
  founding: 'I started United Properties for that moment.',
  selection:
    "Every property we present is chosen for its potential, never to add one more listing to the window. That's why every move we make is built the same way: research first, a fair price, professional presentation, and clear numbers behind every decision.",
  trust: 'That is how trust is earned, and how success stories begin.',
  closing:
    'The day you decide should feel like the first day of something new, with inspiration, turned into confidence.',
  company: 'PKM United Properties Ltd',
  licence: 'Reg. No. 1393  ·  Lic. No. 703/E',
}

const WHAT_WE_DO = [
  { title: 'Invest', text: 'Land and properties, with the numbers laid out clearly.', to: '/services#invest-with-us' },
  { title: 'Sell', text: 'A fair price, presented at its best.', to: '/services#sell-with-us' },
  { title: 'Manage', text: 'Rental placement or full management.', to: '/services#property-management' },
  { title: 'Buy', text: 'Properties for sale.', to: '/buy' },
  { title: 'Rent', text: 'Long-term rentals.', to: '/rent' },
]

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
            'A boutique real estate agency born in Limassol. Meet Panagiotis and the idea behind United Properties.',
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
            <span className="lbl">{COPY.eyebrow}</span>
            {reduceMotion ? (
              <h1 className="intro-title" id="about-manifesto-heading">
                {COPY.heading}
              </h1>
            ) : (
              <h1 className="intro-title" id="about-manifesto-heading" aria-label={COPY.heading}>
                {HEADING_WORDS.map((word, i) => (
                  <span key={word} className="bw" style={{ animationDelay: `${0.05 + i * 0.1}s` }}>
                    {word}
                  </span>
                ))}
              </h1>
            )}
          </div>
        </section>

        <section className="up-about__letter" data-cms-page="about" data-cms-section="manifesto">
          <div className="sheet">
            <div className="ltr">
              <div className="orn" aria-hidden>
                <i />
                <b />
                <i />
              </div>
              <p className="opener">{COPY.opener}</p>
              <div className="gold" aria-hidden />
              <p>{COPY.intro}</p>
              <p className="strong">{COPY.founding}</p>
              <p>{COPY.selection}</p>
              <p>{COPY.trust}</p>
              <p>{COPY.closing}</p>
              <hr className="ltr-rule" />
              <div className="cred">
                <span className="cn">{COPY.company}</span>
                <span className="cl">{COPY.licence}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="up-about__wwd" aria-labelledby="about-wwd-heading">
          <div className="up-about__shell">
            <span className="lbl">What we do</span>
            <h2 id="about-wwd-heading" className="up-about__wwd-title">
              Residential and commercial.
            </h2>
            <div className="wwd">
              {WHAT_WE_DO.map((item) => (
                <Link key={item.title} to={item.to}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default About
