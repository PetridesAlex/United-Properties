import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import CmsText from '../CmsPreview/CmsText'
import CmsStaggeredHeading from '../StaggeredText/CmsStaggeredHeading'
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
  {
    key: 'maintenance',
    label: 'Maintenance and repairs',
    placement: false,
    full: true,
  },
  {
    key: 'checks',
    label: 'Property checks and performance reports',
    placement: false,
    full: true,
  },
  {
    key: 'utilities',
    label: 'Utilities and bills',
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

  const bestLabel = get('services', 'property_mgmt', 'best_label', 'Best for')
  const plans = [
    {
      key: 'placement',
      badge: '01',
      featured: false,
      title: get('services', 'property_mgmt', 'placement_title', 'Rental placement'),
      titleField: 'placement_title',
      tagline: get('services', 'property_mgmt', 'placement_tagline', 'Your terms. Our network.'),
      taglineField: 'placement_tagline',
      best: get('services', 'property_mgmt', 'placement_best', 'Active ownership'),
      bestField: 'placement_best',
      includedKey: 'placement',
    },
    {
      key: 'full',
      badge: '02',
      featured: true,
      title: get('services', 'property_mgmt', 'full_title', 'Full property management'),
      titleField: 'full_title',
      tagline: get('services', 'property_mgmt', 'full_tagline', 'You own it. We run it.'),
      taglineField: 'full_tagline',
      best: get('services', 'property_mgmt', 'full_best', 'Hands-free ownership'),
      bestField: 'full_best',
      includedKey: 'full',
    },
  ]

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
          <CmsStaggeredHeading
            page="services"
            section="property_mgmt"
            field="heading"
            as="h2"
            id="property-management-heading"
            className="property-mgmt__heading"
            text={get('services', 'property_mgmt', 'heading', 'Property management')}
          />
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
          className="property-mgmt__table-wrap property-mgmt__table-wrap--desktop"
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
                {plans.map((plan) => (
                  <th
                    key={plan.key}
                    scope="col"
                    className={`property-mgmt__plan-head${plan.featured ? ' property-mgmt__plan-head--featured' : ''}`}
                  >
                    <span
                      className={`property-mgmt__plan-badge${plan.featured ? ' property-mgmt__plan-badge--gold' : ''}`}
                    >
                      {plan.badge}
                    </span>
                    <CmsText
                      page="services"
                      section="property_mgmt"
                      field={plan.titleField}
                      as="span"
                      className="property-mgmt__plan-title"
                    >
                      {plan.title}
                    </CmsText>
                    <CmsText
                      page="services"
                      section="property_mgmt"
                      field={plan.taglineField}
                      as="span"
                      className="property-mgmt__plan-tagline"
                    >
                      {plan.tagline}
                    </CmsText>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <motion.tr className="property-mgmt__best-row" variants={reduceMotion ? undefined : rowReveal}>
                <th scope="row">{bestLabel}</th>
                {plans.map((plan) => (
                  <td key={plan.key}>
                    <span
                      className={`property-mgmt__best-pill${plan.featured ? ' property-mgmt__best-pill--gold' : ''}`}
                    >
                      <CmsText page="services" section="property_mgmt" field={plan.bestField} as="span">
                        {plan.best}
                      </CmsText>
                    </span>
                  </td>
                ))}
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
                  {plans.map((plan) => (
                    <td
                      key={plan.key}
                      className={plan.featured ? 'property-mgmt__cell--featured' : undefined}
                    >
                      <CellMark
                        included={feature[plan.includedKey]}
                        label={feature.label}
                        delay={(plan.featured ? 0.18 : 0.12) + index * 0.07}
                        reduceMotion={reduceMotion}
                      />
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </motion.div>

        <motion.div
          className="property-mgmt__mobile"
          aria-label="Plan comparison"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {plans.map((plan, planIndex) => (
            <article
              key={plan.key}
              className={`property-mgmt__card${plan.featured ? ' property-mgmt__card--featured' : ''}`}
            >
              <header className="property-mgmt__card-head">
                <span
                  className={`property-mgmt__plan-badge${plan.featured ? ' property-mgmt__plan-badge--gold' : ''}`}
                >
                  {plan.badge}
                </span>
                <CmsText
                  page="services"
                  section="property_mgmt"
                  field={plan.titleField}
                  as="h3"
                  className="property-mgmt__plan-title"
                >
                  {plan.title}
                </CmsText>
                <CmsText
                  page="services"
                  section="property_mgmt"
                  field={plan.taglineField}
                  as="p"
                  className="property-mgmt__plan-tagline"
                >
                  {plan.tagline}
                </CmsText>
                <div className="property-mgmt__card-best">
                  <span className="property-mgmt__card-best-label">{bestLabel}</span>
                  <span
                    className={`property-mgmt__best-pill${plan.featured ? ' property-mgmt__best-pill--gold' : ''}`}
                  >
                    <CmsText page="services" section="property_mgmt" field={plan.bestField} as="span">
                      {plan.best}
                    </CmsText>
                  </span>
                </div>
              </header>

              <ul className="property-mgmt__card-list">
                {features.map((feature, index) => {
                  const included = feature[plan.includedKey]
                  return (
                    <li
                      key={feature.key}
                      className={`property-mgmt__card-item${included ? ' is-included' : ' is-excluded'}`}
                    >
                      <CellMark
                        included={included}
                        label={feature.label}
                        delay={0.08 + planIndex * 0.06 + index * 0.04}
                        reduceMotion={reduceMotion}
                      />
                      <CmsText
                        page="services"
                        section="property_mgmt"
                        field={`${feature.key}_label`}
                        as="span"
                        className="property-mgmt__card-item-label"
                      >
                        {feature.label}
                      </CmsText>
                    </li>
                  )
                })}
              </ul>
            </article>
          ))}
        </motion.div>

        <motion.div
          className="property-mgmt__cta"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="property-mgmt__cta-rule" aria-hidden />
          <motion.div
            className="property-mgmt__cta-action"
            whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            <Link to="/contact" className="property-mgmt__cta-btn">
              <span className="property-mgmt__cta-btn-glow" aria-hidden />
              <span className="property-mgmt__cta-btn-sheen" aria-hidden />
              <CmsText
                page="services"
                section="property_mgmt"
                field="cta_label"
                as="span"
                className="property-mgmt__cta-btn-label"
              >
                {get('services', 'property_mgmt', 'cta_label', 'Talk to us')}
              </CmsText>
            </Link>
          </motion.div>
          <div className="property-mgmt__cta-copy">
            <CmsText
              page="services"
              section="property_mgmt"
              field="cta_heading"
              as="p"
              className="property-mgmt__cta-heading"
            >
              {get(
                'services',
                'property_mgmt',
                'cta_heading',
                'Not sure which plan fits?',
              )}
            </CmsText>
            <CmsText
              page="services"
              section="property_mgmt"
              field="cta_body"
              as="p"
              className="property-mgmt__cta-body"
            >
              {get(
                'services',
                'property_mgmt',
                'cta_body',
                "Tell us about your property, and we'll recommend the right one.",
              )}
            </CmsText>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PropertyManagementSection
