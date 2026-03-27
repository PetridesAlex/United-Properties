import { Helmet } from 'react-helmet-async'
import { useMemo, useState } from 'react'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import AgentCard from '../components/AgentCard/AgentCard'
import { agents } from '../data/agents'
import './Agents.css'

function Agents() {
  const [specialty, setSpecialty] = useState('')

  const specialties = useMemo(() => {
    const values = agents.map((agent) => agent.specialization)
    return Array.from(new Set(values))
  }, [])

  const visibleAgents = specialty
    ? agents.filter((agent) => agent.specialization === specialty)
    : agents

  return (
    <>
      <Helmet>
        <title>Agents | United Properties</title>
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <p>Advisory Team</p>
          <h1>Meet Our Real Estate Professionals</h1>
          <p>
            Specialists in luxury homes, investments, developments, and international
            client guidance across Cyprus.
          </p>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeader title="Advisors by Specialization" />
          <label htmlFor="specialty-filter" className="agents-filter">
            <span className="agents-filter__label">Filter by specialty</span>
            <select
              className="agents-filter__select"
              id="specialty-filter"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            >
              <option value="">All specialties</option>
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="grid-3 agents-grid">
            {visibleAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Agents
