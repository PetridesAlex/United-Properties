import { motion, useReducedMotion } from 'framer-motion'
import CmsText from '../CmsPreview/CmsText'
import { useSiteContent } from '../../hooks/useSiteContent'
import './PropertyManagementSection.css'

const FEATURE_DEFAULTS = [
  {
    key: 'screening',
    label: 'Tenant screening and placement',
    placement: true,
    full: true,
  },
  {
    key: 'marketing',
    label: 'Marketing through our channels and network',
    placement: true,
    full: true,
  },
  {
    key: 'agreement',
    label: 'Rental agreement drafting',
    placement: true,
    full: true,
  },
  {
    key: 'support',
    label: 'Personal support during the whole tenancy period',
    placement: true,
    full: true,
  },
  {
    key: 'rent',
    label: 'Rent collection',
    placement: false,
    full: true,
  },
]

const tableReveal = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
}

const rowReveal = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

function CellMark({ included, label, delay = 0, reduceMotion }) {
  if (included) {
    return (
      <motion.span
        className="property-mgmt__mark property-mgmt__mark--yes"
        aria-label={`${label}: included`}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.55 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 18,
          delay: reduceMotion ? 0 : delay,
        }}
      >
        <span className="property-mgmt__mark-ring" aria-hidden />
        <svg
          className="property-mgmt__check"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <motion.path
            d="M20 6 9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              pathLength: { duration: 0.42, delay: reduceMotion ? 0 : delay + 0.08, ease: 'easeOut' },
              opacity: { duration: 0.2, delay: reduceMotion ? 0 : delay + 0.08 },
            }}
          />
        </svg>
      </motion.span>
    )
  }

  return (
    <motion.span
      className="property-mgmt__mark property-mgmt__mark--no"
      aria-label={`${label}: not included`}
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.35, delay: reduceMotion ? 0 : delay }}
    >
      —
    </motion.span>
  )
}

function PropertyManagementSection() {
  const { get } = useSiteContent()
  const reduceMotion = useReducedMotion()

  const features = FEATURE_DEFAULTS.map((item) => ({
    ...item,
    label: get('services', 'property_mgmt', `${item.key}_label`, item.label),
  }))

  return (
    <section
      id="property-management"
      className="section section--alt property-mgmt"
      aria-labelledby="property-management-heading"
      data-cms-page="services"
      data-cms-section="property_mgmt"
    >
      <div className="container">
        <motion.header
          className="property-mgmt__header"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
        >
          <CmsText
            page="services"
            section="property_mgmt"
            field="eyebrow"
            as="p"
            className="property-mgmt__eyebrow"
          >
            {get('services', 'property_mgmt', 'eyebrow', 'United Services')}
          </CmsText>
          <CmsText
            page="services"
            section="property_mgmt"
            field="heading"
            as="h2"
            id="property-management-heading"
            className="property-mgmt__heading"
          >
            {get('services', 'property_mgmt', 'heading', 'Property management')}
          </CmsText>
          <div className="property-mgmt__intro">
            <CmsText
              page="services"
              section="property_mgmt"
              field="lead"
              as="p"
              className="property-mgmt__lead"
            >
              {get('services', 'property_mgmt', 'lead', 'Let your property work for you.')}
            </CmsText>
            <CmsText
              page="services"
              section="property_mgmt"
              field="tagline"
              as="p"
              className="property-mgmt__tagline"
            >
              {get('services', 'property_mgmt', 'tagline', 'Two plans. One standard of care.')}
            </CmsText>
          </div>
        </motion.header>

        <motion.div
          className="property-mgmt__table-wrap"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="property-mgmt__table-glow" aria-hidden />
          <div className="property-mgmt__table-sheen" aria-hidden />

          <motion.table
            className="property-mgmt__table"
            variants={reduceMotion ? undefined : tableReveal}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            <caption className="visually-hidden">
              Comparison of Rental placement and Full property management plans
            </caption>
            <thead>
              <tr>
                <th scope="col" className="property-mgmt__corner">
                  <span className="visually-hidden">Feature</span>
                </th>
                <th scope="col" className="property-mgmt__plan-head">
                  <span className="property-mgmt__plan-badge">01</span>
                  <CmsText
                    page="services"
                    section="property_mgmt"
                    field="placement_title"
                    as="span"
                    className="property-mgmt__plan-title"
                  >
                    {get('services', 'property_mgmt', 'placement_title', 'Rental placement')}
                  </CmsText>
                  <CmsText
                    page="services"
                    section="property_mgmt"
                    field="placement_tagline"
                    as="span"
                    className="property-mgmt__plan-tagline"
                  >
                    {get('services', 'property_mgmt', 'placement_tagline', 'Your terms. Our network.')}
                  </CmsText>
                </th>
                <th scope="col" className="property-mgmt__plan-head property-mgmt__plan-head--featured">
                  <span className="property-mgmt__plan-badge property-mgmt__plan-badge--gold">02</span>
                  <CmsText
                    page="services"
                    section="property_mgmt"
                    field="full_title"
                    as="span"
                    className="property-mgmt__plan-title"
                  >
                    {get('services', 'property_mgmt', 'full_title', 'Full property management')}
                  </CmsText>
                  <CmsText
                    page="services"
                    section="property_mgmt"
                    field="full_tagline"
                    as="span"
                    className="property-mgmt__plan-tagline"
                  >
                    {get('services', 'property_mgmt', 'full_tagline', 'You own it. We run it.')}
                  </CmsText>
                </th>
              </tr>
            </thead>
            <tbody>
              <motion.tr className="property-mgmt__best-row" variants={reduceMotion ? undefined : rowReveal}>
                <th scope="row">
                  {get('services', 'property_mgmt', 'best_label', 'Best for')}
                </th>
                <td>
                  <span className="property-mgmt__best-pill">
                    <CmsText page="services" section="property_mgmt" field="placement_best" as="span">
                      {get('services', 'property_mgmt', 'placement_best', 'Active ownership')}
                    </CmsText>
                  </span>
                </td>
                <td>
                  <span className="property-mgmt__best-pill property-mgmt__best-pill--gold">
                    <CmsText page="services" section="property_mgmt" field="full_best" as="span">
                      {get('services', 'property_mgmt', 'full_best', 'Hands-free ownership')}
                    </CmsText>
                  </span>
                </td>
              </motion.tr>
              {features.map((feature, index) => (
                <motion.tr
                  key={feature.key}
                  className="property-mgmt__feature-row"
                  variants={reduceMotion ? undefined : rowReveal}
                >
                  <th scope="row">
                    <CmsText
                      page="services"
                      section="property_mgmt"
                      field={`${feature.key}_label`}
                      as="span"
                    >
                      {feature.label}
                    </CmsText>
                  </th>
                  <td>
                    <CellMark
                      included={feature.placement}
                      label={feature.label}
                      delay={0.12 + index * 0.07}
                      reduceMotion={reduceMotion}
                    />
                  </td>
                  <td className="property-mgmt__cell--featured">
                    <CellMark
                      included={feature.full}
                      label={feature.label}
                      delay={0.18 + index * 0.07}
                      reduceMotion={reduceMotion}
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </motion.div>
      </div>
    </section>
  )
}

export default PropertyManagementSection
