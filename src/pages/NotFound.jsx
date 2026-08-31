import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useSiteContent } from '../hooks/useSiteContent'

function NotFound() {
  const { get } = useSiteContent()

  return (
    <>
      <Helmet>
        <title>Page Not Found | United Properties</title>
      </Helmet>
      <section className="page-hero page-hero--404">
        <div className="container" style={{ textAlign: 'center' }}>
          <p>{get('not-found', 'hero', 'code', '404')}</p>
          <h1>{get('not-found', 'hero', 'heading', 'Page Not Found')}</h1>
          <p>
            {get(
              'not-found',
              'hero',
              'description',
              'The page you are looking for does not exist or has moved.',
            )}
          </p>
          <Link to="/" className="btn btn-gold">
            {get('not-found', 'hero', 'cta', 'Back to Home')}
          </Link>
        </div>
      </section>
    </>
  )
}

export default NotFound
