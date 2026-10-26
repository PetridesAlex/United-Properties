import {useEffect} from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import CmsText from '../components/CmsPreview/CmsText'
import CmsStaggeredHeading from '../components/StaggeredText/CmsStaggeredHeading'
import { useSiteContent } from '../hooks/useSiteContent'

function NotFound() {
  const { get } = useSiteContent()
  const pageTitle = `${get('not-found', 'hero', 'heading', 'Page Not Found') || 'Page Not Found'} | United Properties`

  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <section className="page-hero page-hero--404" data-cms-page="not-found" data-cms-section="hero">
        <div className="container" style={{ textAlign: 'center' }}>
          <CmsText page="not-found" section="hero" field="code" as="p">
            {get('not-found', 'hero', 'code', '404')}
          </CmsText>
          <CmsStaggeredHeading
            page="not-found"
            section="hero"
            field="heading"
            as="h1"
            text={get('not-found', 'hero', 'heading', 'Page Not Found')}
          />
          <CmsText page="not-found" section="hero" field="description" as="p">
            {get(
              'not-found',
              'hero',
              'description',
              'The page you are looking for does not exist or has moved.',
            )}
          </CmsText>
          <Link to="/" className="btn btn-gold">
            <CmsText page="not-found" section="hero" field="cta" as="span">
              {get('not-found', 'hero', 'cta', 'Back to Home')}
            </CmsText>
          </Link>
        </div>
      </section>
    </>
  )
}

export default NotFound
