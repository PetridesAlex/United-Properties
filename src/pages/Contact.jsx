import { Helmet } from 'react-helmet-async'
import { MessageCircle, MapPin, Phone, Mail, Clock4 } from 'lucide-react'
import InquiryForm from '../components/InquiryForm/InquiryForm'
import './Contact.css'

function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact | UNITED PROPERTIES</title>
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <p>Contact</p>
          <h1>Start a Private Real Estate Consultation</h1>
          <p>
            Connect with our team for sales, rentals, developments, relocation, and
            investment strategy in Cyprus.
          </p>
        </div>
      </section>

      <section className="section section--light contact-section">
        <div className="container contact-grid">
          <div className="contact-grid__details">
            <article className="card-luxury contact-card">
              <h3>Office Details</h3>
              <p>
                <MapPin size={16} /> 18 Marina Avenue, Limassol, Cyprus
              </p>
              <p>
                <Phone size={16} /> <a href="tel:+35725123456">+357 25 123 456</a>
              </p>
              <p>
                <Mail size={16} /> <a href="mailto:info@unitedproperties.eu">info@unitedproperties.eu</a>
              </p>
              <p>
                <Clock4 size={16} /> Mon - Fri: 9:00 - 18:00
              </p>
            </article>

            <article className="card-luxury contact-card">
              <h3>WhatsApp Support</h3>
              <p>Get quick answers from our client advisory team.</p>
              <a
                href="https://wa.me/35700000000"
                target="_blank"
                rel="noreferrer"
                className="btn btn-gold"
              >
                <MessageCircle size={16} /> WhatsApp Inquiry
              </a>
            </article>

            <article className="card-luxury contact-card">
              <h3>Map Placeholder</h3>
              <p>Map integration area reserved for future Google Maps or API embed.</p>
            </article>
          </div>

          <InquiryForm />
        </div>
      </section>
    </>
  )
}

export default Contact
