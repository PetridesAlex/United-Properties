export type ContentFieldType = 'text' | 'textarea'

export type ContentFieldDef = {
  key: string
  label: string
  help?: string
  type: ContentFieldType
  rows?: number
  defaultValue: string
}

export type ContentSectionDef = {
  id: string
  title: string
  description: string
  fields: ContentFieldDef[]
}

export type ContentPageDef = {
  id: string
  title: string
  description: string
  path: string
  sections: ContentSectionDef[]
}

/** Shorthand for field definitions */
export function f(
  key: string,
  label: string,
  defaultValue: string,
  type: ContentFieldType = 'text',
  rows = 3,
): ContentFieldDef {
  return type === 'textarea'
    ? {key, label, type, rows, defaultValue}
    : {key, label, type, defaultValue}
}

export function contentKey(page: string, section: string, fieldKey: string) {
  return `${page}.${section}.${fieldKey}`
}

/** Parse `page.section.field` (page id may contain hyphens, e.g. not-found). */
export function parseContentKey(
  fullKey: string,
): {page: string; section: string; key: string; fullKey: string} | null {
  const parts = String(fullKey || '').split('.')
  if (parts.length < 3) return null
  const key = parts.pop() as string
  const section = parts.pop() as string
  const page = parts.join('.')
  if (!page || !section || !key) return null
  return {page, section, key, fullKey: contentKey(page, section, key)}
}

/** DOM attrs for click-to-edit markers on a single field. */
export function cmsFieldProps(page: string, section: string, field: string) {
  const fullKey = contentKey(page, section, field)
  return {
    'data-cms-page': page,
    'data-cms-section': section,
    'data-cms-field': field,
    'data-cms-keys': fullKey,
    'data-cms-editable': '1' as const,
  }
}
