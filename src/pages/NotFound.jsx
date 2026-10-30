import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import './NotFound.css'

const WORDS = ['We', "can't", 'find', 'that', 'page.']

function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page not found | United Properties</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <section className="up-nf" data-cms-page="not-found">
        <div className="up-nf__inner">
          <span className="lbl">PAGE NOT FOUND</span>
          <h1 aria-label="We can't find that page.">
            {WORDS.map((w, i) => (
              <span key={w} className="bw">
                {w}
                {i < WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          <p className="up-nf__lead fc">
            The address may be wrong, or the page may have moved. These may help.
          </p>
          <div className="up-nf__acts">
            <Link className="up-nf__btn" to="/">
              Back to the home page
            </Link>
            <Link className="up-nf__btn" to="/buy">
              Browse properties
            </Link>
            <Link className="up-nf__btn" to="/contact">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default NotFound
