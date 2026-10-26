import { Helmet } from 'react-helmet-async'
import { useSiteContent } from '../hooks/useSiteContent'
import UnitedServices from './UnitedServices'

function Services() {
  const { get } = useSiteContent()

  return (
    <>
      <Helmet>
        <title>{get('services', 'seo', 'title', 'United Services | United Properties')}</title>
        <meta
          name="description"
          content={get(
            'services',
            'seo',
            'description',
            'Invest, sell, and manage with United Properties — curated opportunities, fair sales, and hands-on property care.',
          )}
        />
      </Helmet>

      <UnitedServices />
    </>
  )
}

export default Services
