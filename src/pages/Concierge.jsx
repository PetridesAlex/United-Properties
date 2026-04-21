import { Helmet } from 'react-helmet-async'

function Concierge() {
  return (
    <>
      <Helmet>
        <title>Concierge | United Properties</title>
      </Helmet>
      <section className="section section--light" style={{ minHeight: '50vh' }} aria-label="Concierge" />
    </>
  )
}

export default Concierge
