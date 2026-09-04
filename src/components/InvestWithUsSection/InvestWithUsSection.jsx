import { motion } from 'framer-motion'
import InvestHowItWorksTimeline from '../InvestHowItWorksTimeline/InvestHowItWorksTimeline'
import { useSiteContent } from '../../hooks/useSiteContent'
import './InvestWithUsSection.css'

function InvestWithUsSection() {
  const { get } = useSiteContent()

  return (
    <section
      id="invest-with-us"
      className="section section--alt invest-with-us"
      aria-labelledby="invest-with-us-heading"
      data-cms-page="services"
      data-cms-section="invest_body"
    >
      <div className="container">
        <motion.article
          className="invest-with-us__article"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55 }}
        >
          <header className="invest-with-us__header">
            <p className="invest-with-us__eyebrow">
              {get('services', 'invest_body', 'eyebrow', 'United Services')}
            </p>
            <h2 id="invest-with-us-heading">
              {get('services', 'invest_body', 'heading', 'Invest With Us')}
            </h2>
          </header>

          <div className="invest-with-us__prose">
            <p>
              {get(
                'services',
                'invest_body',
                'p1',
                'Investing with United Properties means entering carefully curated opportunities, not mass‑market products. Each investment package is built around a specific plot of land and a clear story: what can be created there, who it will serve, and how it can perform in today’s market.',
              )}
            </p>
            <p>
              {get(
                'services',
                'invest_body',
                'p2',
                'For every project, we study the planning zone and building density to understand exactly what is possible on the land. Then, together with our trusted architects, engineers and construction partners, we shape a concept that fits both the plot and the neighbourhood. Your numbers are grounded in real design and real build costs, not rough estimates.',
              )}
            </p>
            <p>
              {get(
                'services',
                'invest_body',
                'p3',
                'Market data and local insight allow us to forecast achievable selling prices or rental rates, and to translate them into a clear picture of total investment, expected returns and timeline. Behind each forecast stands a tightly connected team of professionals: legal advisors, designers and contractors who work in sync with United Properties. Everything you see in our investment packages is the result of this united network working as one.',
              )}
            </p>
            <p>
              {get(
                'services',
                'invest_body',
                'p4',
                'You are never just "buying a project on paper". You are partnering with a boutique agency that brings all key partners under one roof – lawyers, architects, engineers and constructors – so your investment benefits from a coordinated, end‑to‑end approach.',
              )}
            </p>
          </div>
        </motion.article>

        <InvestHowItWorksTimeline />

        <motion.div
          className="invest-with-us__network invest-with-us__network--ticket card-luxury"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
        >
          <span className="invest-with-us__network-glare" aria-hidden />
          <div className="invest-with-us__network-ticket-head">
            <span className="invest-with-us__network-badge">
              {get('services', 'invest_network', 'badge', 'Private network access')}
            </span>
          </div>
          <div className="invest-with-us__network-ticket-body">
            <span className="invest-with-us__network-perf" aria-hidden />
            <div className="invest-with-us__network-ticket-copy">
              <h3 className="invest-with-us__network-title">
                {get('services', 'invest_network', 'heading', 'A curated, united network of experts')}
              </h3>
              <p className="invest-with-us__network-body">
                {get(
                  'services',
                  'invest_network',
                  'body',
                  'Behind every package stands a small, carefully chosen team: lawyers who understand Cyprus real estate, architects and engineers who design with both efficiency and lifestyle in mind, and constructors who deliver the quality we promise. United Properties brings these key partners together, aligning their expertise around your project so you can invest with confidence.',
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default InvestWithUsSection
