import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { SITE_ORIGIN } from '../config/site'
import { useSiteContent } from '../hooks/useSiteContent'
import './HeroVideoWatch.css'

/** Same file as homepage hero background — this page is the dedicated “watch” URL for indexing. */
const VIDEO_SRC = '/video/hero-video-optimize-united-properties.mp4'
const POSTER_SRC = '/images/video/hero-luxury-real-estate-cyprus-poster.jpg'

const PATH = '/videos/luxury-real-estate-cyprus'

/** ISO 8601 — set when the video was first published on this page (update if you replace the file). */
const VIDEO_UPLOAD_DATE = '2026-04-15T10:00:00+03:00'

function buildVideoJsonLd({ name, description, canonicalUrl, contentUrl, thumbnailUrl }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl: [thumbnailUrl],
    uploadDate: VIDEO_UPLOAD_DATE,
    duration: 'PT15S',
    contentUrl,
    embedUrl: canonicalUrl,
    inLanguage: 'en',
  }
}

function HeroVideoWatch() {
  const { get } = useSiteContent()
  const pageTitle = get(
    'video',
    'seo',
    'title',
    'Luxury Real Estate Cyprus — Brand Video | United Properties',
  )
  const metaDescription = get(
    'video',
    'seo',
    'description',
    'Watch our United Properties showcase video: luxury homes, seafront living, and premium real estate across Cyprus.',
  )
  const canonicalUrl = `${SITE_ORIGIN}${PATH}`
  const contentUrl = `${SITE_ORIGIN}${VIDEO_SRC}`
  const thumbnailUrl = `${SITE_ORIGIN}${POSTER_SRC}`
  const jsonLd = buildVideoJsonLd({
    name: get('video', 'seo', 'json_name', 'United Properties — Luxury Real Estate in Cyprus'),
    description: metaDescription,
    canonicalUrl,
    contentUrl,
    thumbnailUrl,
  })

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:video" content={contentUrl} />
        <meta property="og:video:type" content="video/mp4" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={thumbnailUrl} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <section className="page-hero video-watch__hero">
        <div className="container">
          <p className="video-watch__eyebrow">{get('video', 'hero', 'eyebrow')}</p>
          <h1 className="video-watch__title">{get('video', 'hero', 'heading')}</h1>
          <p className="video-watch__lede">{get('video', 'hero', 'description')}</p>
        </div>
      </section>

      <section className="section section--light video-watch__section">
        <div className="container video-watch__inner">
          <div className="video-watch__player-wrap">
            <video
              className="video-watch__video"
              controls
              playsInline
              preload="metadata"
              poster={POSTER_SRC}
              src={VIDEO_SRC}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="video-watch__copy">
            <p>{get('video', 'body', 'paragraph')}</p>
            <p className="video-watch__actions">
              <Link to="/properties" className="btn btn-gold">
                {get('video', 'body', 'btn_listings')}
              </Link>
              <Link to="/" className="btn video-watch__btn-muted">
                {get('video', 'body', 'btn_home')}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default HeroVideoWatch
