import {contentKey} from '../../lib/content/schema'
import StaggeredText from './StaggeredText'

/**
 * CMS-marked heading with Motion staggered word reveal.
 */
export default function CmsStaggeredHeading({
  page,
  section,
  field,
  text,
  as = 'h1',
  className,
  id,
  separator,
  segmentBy = 'words',
  direction = 'top',
  delay = 80,
  duration = 0.6,
  blur = true,
  staggerDirection = 'forward',
  exitOnScrollOut = true,
  ...rest
}) {
  if (!text) return null

  const fullKey = contentKey(page, section, field)

  return (
    <StaggeredText
      text={String(text)}
      as={as}
      className={className}
      id={id}
      separator={separator}
      segmentBy={segmentBy}
      direction={direction}
      delay={delay}
      duration={duration}
      blur={blur}
      staggerDirection={staggerDirection}
      exitOnScrollOut={exitOnScrollOut}
      data-cms-page={page}
      data-cms-section={section}
      data-cms-field={field}
      data-cms-keys={fullKey}
      data-cms-editable="1"
      {...rest}
    />
  )
}
