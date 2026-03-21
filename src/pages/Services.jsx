import { Helmet } from 'react-helmet-async'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import ServiceCard from '../components/ServiceCard/ServiceCard'
import CTASection from '../components/CTASection/CTASection'
import { services } from '../data/services'

function Services() {
  return (
    <>
      <Helmet>
        <title>Services | UNITED PROPERTIES</title>
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <p>Services</p>
          <h1>Premium Real Estate Services</h1>
          <p>
            Comprehensive support for sales, rentals, investment, management, and
            international relocation in Cyprus.
          </p>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeader
            title="Tailored Service Lines"
            description="Every service is designed for precision execution and premium client experience."
          />
          <div className="grid-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Discuss Your Property Goals With Our Advisory Team" />
    </>
  )
}

export default Services
