export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function ensureUniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>,
  excludeId?: string,
): Promise<string> {
  let candidate = slugify(base) || 'property'
  let n = 2
  while (await checkExists(candidate)) {
    // If excludeId matches this slug's property, treat as ok — caller handles
    void excludeId
    candidate = `${slugify(base) || 'property'}-${n}`
    n += 1
    if (n > 200) break
  }
  return candidate
}
