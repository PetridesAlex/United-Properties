/** Friendly display names for known admin logins. */
const EMAIL_DISPLAY: Record<string, {name: string; roleLabel: string}> = {
  'listings@unitedproperties.eu': {
    name: 'Panos',
    roleLabel: 'Administrator',
  },
  'petridesalexeu@gmail.com': {
    name: 'Dev',
    roleLabel: 'Developer',
  },
}

export function resolveAdminDisplay(profile?: {
  email?: string | null
  full_name?: string | null
  role?: string | null
} | null) {
  const email = profile?.email?.trim().toLowerCase() || ''
  const mapped = email ? EMAIL_DISPLAY[email] : undefined

  if (mapped) {
    return {
      firstName: mapped.name,
      roleLabel: mapped.roleLabel,
      email,
    }
  }

  const fromName = profile?.full_name?.trim().split(/\s+/)[0]
  const fromEmail = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim().split(/\s+/)[0]
  const firstName = fromName || fromEmail || 'there'

  const role = profile?.role
  const roleLabel = role
    ? role
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Staff'

  return {firstName, roleLabel, email}
}
