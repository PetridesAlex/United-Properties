import {contentKey} from '../../lib/content/schema'

/**
 * Renders CMS copy with explicit field markers so the inline editor
 * can always find headers and body text (no fragile text matching).
 */
export default function CmsText({
  page,
  section,
  field,
  as: Tag = 'span',
  children,
  className,
  ...rest
}) {
  const fullKey = contentKey(page, section, field)
  return (
    <Tag
      className={className}
      data-cms-page={page}
      data-cms-section={section}
      data-cms-field={field}
      data-cms-keys={fullKey}
      data-cms-editable="1"
      {...rest}
    >
      {children}
    </Tag>
  )
}
