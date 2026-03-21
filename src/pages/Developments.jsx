import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import CTASection from '../components/CTASection/CTASection'
import { developments } from '../data/developments'
import './Developments.css'

function Developments() {
  return (
    <>
      <Helmet>
        <title>Developments | UNITED PROPERTIES</title>
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <p>New Developments</p>
          <h1>Future-Focused Residential Projects</h1>
          <p>
            Access premium off-plan opportunities with strong location fundamentals and
            investment potential.
          </p>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeader title="Featured Developments" />
          <div className="developments-grid">
            {developments.map((development) => (
              <article className="card-luxury development-card" key={development.id}>
                <img src={development.image} alt={development.name} />
                <div>
                  <p className="development-card__status">{development.status}</p>
                  <h3>{development.name}</h3>
                  <p>{development.area}</p>
                  <p>{development.description}</p>
                  <p>{development.investmentAngle}</p>
                  <Link to="/contact" className="btn btn-outline-dark">
                    Inquire
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Secure Early Access to Premium Cyprus Developments" />
    </>
  )
}

export default Developments
