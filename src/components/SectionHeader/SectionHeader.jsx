import { motion } from 'framer-motion'
import './SectionHeader.css'

/**
 * Section header. Pass cmsPage + cmsSection to mark eyebrow/title/description
 * for click-to-edit (field keys: eyebrow, heading, description).
 */
function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
  className = '',
  headingId,
  cmsPage,
  cmsSection,
  eyebrowKey = 'eyebrow',
  titleKey = 'heading',
  descriptionKey = 'description',
}) {
  const classes = `section-header ${center ? 'section-header--center' : ''} ${className}`.trim()
  const marked = Boolean(cmsPage && cmsSection)

  function fieldProps(fieldKey) {
    if (!marked) return {}
    const fullKey = `${cmsPage}.${cmsSection}.${fieldKey}`
    return {
      'data-cms-page': cmsPage,
      'data-cms-section': cmsSection,
      'data-cms-field': fieldKey,
      'data-cms-keys': fullKey,
      'data-cms-editable': '1',
    }
  }

  return (
    <motion.header
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      {...(marked
        ? {'data-cms-page': cmsPage, 'data-cms-section': cmsSection}
        : {})}
    >
      {eyebrow ? (
        <p className="section-header__eyebrow" {...fieldProps(eyebrowKey)}>
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 id={headingId} {...fieldProps(titleKey)}>
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="section-header__description" {...fieldProps(descriptionKey)}>
          {description}
        </p>
      ) : null}
    </motion.header>
  )
}

export default SectionHeader
