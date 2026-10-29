import { Helmet } from 'react-helmet-async'
import { useSiteContent } from '../hooks/useSiteContent'
import UnitedContact from './UnitedContact'

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

      <UnitedContact />
    </>
  )
}

export default Contact
