import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Check, X } from 'lucide-react'
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
    bold: true,
  },
  {
    key: 'marketing',
    label: 'Marketing through our channels and network',
    placement: true,
    full: true,
    bold: true,
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
    bold: true,
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
    bold: true,
  },
  {
    key: 'utilities',
    label: 'Utilities and bills',
    placement: false,
    full: true,
  },
]

function PlanMark({ included, label }) {
  if (included) {
    return (
      <span className="property-mgmt__mark property-mgmt__mark--yes" aria-label={`${label}: included`}>
        <Check className="property-mgmt__icon" strokeWidth={3} aria-hidden />
      </span>
    )
  }

  return (
    <span className="property-mgmt__mark property-mgmt__mark--no" aria-label={`${label}: not included`}>
      <X className="property-mgmt__icon" strokeWidth={3} aria-hidden />
    </span>
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
  const placementTitle = get('services', 'property_mgmt', 'placement_title', 'Rental placement')
  const placementTagline = get(
    'services',
    'property_mgmt',
    'placement_tagline',
    'Your terms. Our network.',
  )
  const placementBest = get('services', 'property_mgmt', 'placement_best', 'Active ownership')
  const fullTitle = get('services', 'property_mgmt', 'full_title', 'Full property management')
  const fullTagline = get('services', 'property_mgmt', 'full_tagline', 'You own it. We run it.')
  const fullBest = get('services', 'property_mgmt', 'full_best', 'Hands-free ownership')

  return (
    <section
      id="property-management"
      className="section section--alt property-mgmt"
      aria-labelledby="property-management-heading"
      data-cms-page="services"
      data-cms-section="property_mgmt"
    >
      <div className="property-mgmt__ambient" aria-hidden />
      <div className="container property-mgmt__shell">
        <motion.header
          className="property-mgmt__header"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
          className="property-mgmt__compare"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.12 }}
        >
          <div className="property-mgmt__compare-head" role="row">
            <span className="property-mgmt__compare-spacer" aria-hidden />
            <div className="property-mgmt__plan-col">
              <CmsText
                page="services"
                section="property_mgmt"
                field="placement_title"
                as="span"
                className="property-mgmt__plan-name"
              >
                {placementTitle}
              </CmsText>
              <CmsText
                page="services"
                section="property_mgmt"
                field="placement_tagline"
                as="span"
                className="property-mgmt__plan-note"
              >
                {placementTagline}
              </CmsText>
            </div>
            <div className="property-mgmt__plan-col property-mgmt__plan-col--featured">
              <CmsText
                page="services"
                section="property_mgmt"
                field="full_title"
                as="span"
                className="property-mgmt__plan-name"
              >
                {fullTitle}
              </CmsText>
              <CmsText
                page="services"
                section="property_mgmt"
                field="full_tagline"
                as="span"
                className="property-mgmt__plan-note"
              >
                {fullTagline}
              </CmsText>
            </div>
          </div>

          <motion.div
            className="property-mgmt__compare-row property-mgmt__compare-row--best"
            role="row"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <span className="property-mgmt__feature-label property-mgmt__feature-label--muted">
              {bestLabel}
            </span>
            <span className="property-mgmt__best">
              <CmsText page="services" section="property_mgmt" field="placement_best" as="span">
                {placementBest}
              </CmsText>
            </span>
            <span className="property-mgmt__best property-mgmt__best--featured">
              <CmsText page="services" section="property_mgmt" field="full_best" as="span">
                {fullBest}
              </CmsText>
            </span>
          </motion.div>

          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              className="property-mgmt__compare-row"
              role="row"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.04 * index }}
            >
              <CmsText
                page="services"
                section="property_mgmt"
                field={`${feature.key}_label`}
                as="span"
                className={`property-mgmt__feature-label${feature.bold ? ' property-mgmt__feature-label--bold' : ''}`}
              >
                {feature.label}
              </CmsText>
              <span className="property-mgmt__mark-cell">
                <PlanMark included={feature.placement} label={feature.label} />
              </span>
              <span className="property-mgmt__mark-cell property-mgmt__mark-cell--featured">
                <PlanMark included={feature.full} label={feature.label} />
              </span>
            </motion.div>
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
              {get('services', 'property_mgmt', 'cta_heading', 'Not sure which plan fits?')}
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
