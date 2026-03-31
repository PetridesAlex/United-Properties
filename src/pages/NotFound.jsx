import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | United Properties</title>
      </Helmet>
      <section className="page-hero page-hero--404">
        <div className="container" style={{ textAlign: 'center' }}>
          <p>404</p>
          <h1>Page Not Found</h1>
          <p>The page you are looking for does not exist or has moved.</p>
          <Link to="/" className="btn btn-gold">
            Back to Home
          </Link>
        </div>
      </section>
    </>
  )
}

export default NotFound
