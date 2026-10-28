import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import './Privacy.css'

function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | United Properties</title>
        <meta
          name="description"
          content="How United Properties collects, uses, and protects personal data."
        />
      </Helmet>

      <main className="up-privacy">
        <div className="up-privacy__inner">
          <p className="up-privacy__eyebrow">United Properties</p>
          <h1>Privacy Policy</h1>
          <p className="up-privacy__lede">
            This page explains how PKM United Properties Ltd handles personal information when you
            use our website or contact us about property services in Cyprus.
          </p>

          <section>
            <h2>Who we are</h2>
            <p>
              PKM United Properties Ltd (Reg. No. 1393 · Lic. No. 703/E)
              <br />
              John F. Kennedy 8, Neapolis, Limassol, Cyprus
              <br />
              <a href="mailto:info@unitedproperties.eu">info@unitedproperties.eu</a>
              {' · '}
              <a href="tel:+35796178188">+357 96178188</a>
            </p>
          </section>

          <section>
            <h2>What we collect</h2>
            <p>
              We may collect contact details and enquiry information you send us (name, email,
              phone, message content), and technical data needed to operate the site (such as IP
              address, device type, and pages visited).
            </p>
          </section>

          <section>
            <h2>How we use it</h2>
            <p>
              We use personal data to respond to enquiries, arrange viewings, provide real-estate
              and related services, improve the website, and meet legal or regulatory obligations.
            </p>
          </section>

          <section>
            <h2>Service providers</h2>
            <p className="up-privacy__placeholder">
              [Placeholder — list of service providers who process data on our behalf.]
            </p>
          </section>

          <section>
            <h2>Analytics</h2>
            <p className="up-privacy__placeholder">
              [Placeholder — analytics tools used on this website.]
            </p>
          </section>

          <section>
            <h2>Hosting</h2>
            <p className="up-privacy__placeholder">
              [Placeholder — hosting provider and location.]
            </p>
          </section>

          <section>
            <h2>Your rights</h2>
            <p>
              Depending on applicable law, you may ask to access, correct, or delete personal data
              we hold about you, or object to certain processing. Contact us at{' '}
              <a href="mailto:info@unitedproperties.eu">info@unitedproperties.eu</a> to make a
              request.
            </p>
          </section>

          <section>
            <h2>Updates</h2>
            <p>
              We may update this policy from time to time. The version published on this page is
              the current one.
            </p>
          </section>

          <p className="up-privacy__back">
            <Link to="/">Back to home</Link>
          </p>
        </div>
      </main>
    </>
  )
}

export default Privacy
