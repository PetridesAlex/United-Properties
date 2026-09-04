import {cmsRegionProps} from '../../lib/content/cmsPreview'

/**
 * Marks a public-site block as clickable in CMS preview mode.
 * Renders as a section by default; pass `as` for other tags.
 */
export default function CmsRegion({page, section, as: Tag = 'section', className = '', children, ...rest}) {
  return (
    <Tag className={className} {...cmsRegionProps(page, section)} {...rest}>
      {children}
    </Tag>
  )
}
