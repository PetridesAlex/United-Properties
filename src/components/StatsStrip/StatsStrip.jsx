import './StatsStrip.css'

function StatsStrip() {
  const metrics = ['1,200+', '18', '96%']

  return (
    <section className="stats-strip">
      <div className="container">
        <div className="stats-strip__content">
          <div className="stats-strip__metrics">
            {metrics.map((metric) => (
              <span key={metric}>{metric}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatsStrip
