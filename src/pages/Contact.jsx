import { Helmet } from 'react-helmet-async'
import InquiryForm from '../components/InquiryForm/InquiryForm'
import { useSiteContent } from '../hooks/useSiteContent'
import UnitedContact from './UnitedContact'
import './Contact.css'

function Contact() {
  const { get } = useSiteContent()

  return (
    <>
      <Helmet>
        <title>{get('contact', 'seo', 'title', 'Contact | United Properties')}</title>
        <meta
          name="description"
          content={get(
            'contact',
            'seo',
            'description',
            'Contact United Properties for sales, rentals, relocation, and investment strategy in Cyprus.',
          )}
        />
      </Helmet>

      <UnitedContact quizHref="#questions" />

      <section id="questions" className="contact-questions" aria-label="Enquiry form">
        <div className="contact-questions__inner">
          <InquiryForm />
        </div>
      </section>
    </>
  )
}

export default Contact
