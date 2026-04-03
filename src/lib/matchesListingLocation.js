/**
 * URL / discovery filters use city names (e.g. Limassol). CMS often stores
 * neighbourhoods (e.g. Mesa Geitonia). Exact equality would hide valid listings.
 */
const AREA_ALIASES = {
  limassol: [
    'mesa geitonia',
    'limassol marina',
    'agios athanasios',
    'germasogeia',
    'agios tychonas',
    'mouttagiaka',
    'polemidia',
    'kapsalos',
    'zakaki',
    'neapoli',
    'agia zoni',
    'agios spyridon',
    'ypsonas',
    'kolossi',
    'fassouri',
    'agios sylas',
    'tourist area',
    'agios tychon',
  ],
  nicosia: ['strovolos', 'engomi', 'aglantzia', 'lakatamia', 'latsia', 'ayios dometios', 'agios dom'],
  paphos: ['coral bay', 'kato paphos', 'peyia', 'chloraka', 'geroskipou', 'embasa'],
  larnaca: ['mackenzie', 'aradippou', 'livadia', 'dromolaxia', 'oroklini'],
  protaras: ['fig tree bay', 'pernera'],
  'ayia napa': ['ayia napa', 'agia napa', 'nissi'],
}

export function matchesListingLocation(propertyLocation, filterLocation) {
  if (!filterLocation) return true
  const p = (propertyLocation || '').trim().toLowerCase()
  const f = filterLocation.trim().toLowerCase()
  if (!p) return false
  if (p === f) return true
  if (p.includes(f)) return true

  const key = f.replace(/\s+/g, ' ')
  const aliases = AREA_ALIASES[key]
  if (aliases?.some((fragment) => p.includes(fragment))) return true

  return false
}
