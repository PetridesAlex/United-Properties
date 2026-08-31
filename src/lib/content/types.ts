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
