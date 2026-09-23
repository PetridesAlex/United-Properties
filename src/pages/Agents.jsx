import { Helmet } from 'react-helmet-async'
import { useMemo, useState } from 'react'
import SectionHeader from '../components/SectionHeader/SectionHeader'
import AgentCard from '../components/AgentCard/AgentCard'
import CmsText from '../components/CmsPreview/CmsText'
import { agents as agentsSeed } from '../data/agents'
import { useSiteContent } from '../hooks/useSiteContent'
import './Agents.css'

function Agents() {
  const { get } = useSiteContent()
  const [specialty, setSpecialty] = useState('')

  const agents = useMemo(
    () =>
      agentsSeed.map((agent) => {
        const n = agent.id
        return {
          ...agent,
          name: get('agents', 'team', `agent${n}_name`, agent.name),
          role: get('agents', 'team', `agent${n}_role`, agent.role),
          specialization: get('agents', 'team', `agent${n}_specialization`, agent.specialization),
          bio: get('agents', 'team', `agent${n}_bio`, agent.bio),
        }
      }),
    [get],
  )

  const specialties = useMemo(() => {
    const values = agents.map((agent) => agent.specialization)
    return Array.from(new Set(values))
  }, [agents])

  const visibleAgents = specialty
    ? agents.filter((agent) => agent.specialization === specialty)
    : agents

  return (
    <>
      <Helmet>
        <title>{get('agents', 'seo', 'title', 'Agents | United Properties')}</title>
        <meta
          name="description"
          content={get(
            'agents',
            'seo',
            'description',
            'Meet the United Properties advisory team — luxury homes, investments, and relocation specialists.',
          )}
        />
      </Helmet>

      <section className="page-hero" data-cms-page="agents" data-cms-section="hero">
        <div className="container">
          <CmsText page="agents" section="hero" field="eyebrow" as="p">
            {get('agents', 'hero', 'eyebrow', 'Advisory Team')}
          </CmsText>
          <CmsText page="agents" section="hero" field="heading" as="h1">
            {get('agents', 'hero', 'heading', 'Meet Our Real Estate Professionals')}
          </CmsText>
          <CmsText page="agents" section="hero" field="description" as="p">
            {get(
              'agents',
              'hero',
              'description',
              'Specialists in luxury homes, investments, portfolio strategy, and international client guidance across Cyprus.',
            )}
          </CmsText>
        </div>
      </section>

      <section className="section section--light" data-cms-page="agents" data-cms-section="list">
        <div className="container">
          <SectionHeader
            title={get('agents', 'list', 'heading', 'Advisors by Specialization')}
            cmsPage="agents"
            cmsSection="list"
          />
          <label htmlFor="specialty-filter" className="agents-filter">
            <CmsText page="agents" section="list" field="filter_label" as="span" className="agents-filter__label">
              {get('agents', 'list', 'filter_label', 'Filter by specialty')}
            </CmsText>
            <select
              className="agents-filter__select"
              id="specialty-filter"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            >
              <option value="">{get('agents', 'list', 'filter_all', 'All specialties')}</option>
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="grid-3 agents-grid" data-cms-page="agents" data-cms-section="team">
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
