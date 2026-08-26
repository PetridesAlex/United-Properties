/** Bazaraki feed constants and legacy helpers. */

export const BAZARAKI_MAX_IMAGES = 16

export const BAZARAKI_FEED_PATH = '/api/bazaraki.xml'

export const BAZARAKI_FEED_URL = 'https://www.unitedproperties.eu/api/bazaraki.xml'

export {resolveAttrsSchema, isBazarakiMappableType, UNMAPPED_BAZARAKI_TYPES} from './schemaResolver'
export {resolveBazarakiRubric, resolveRubricCategory, getRubricCategoryLabel} from './rubricMappings'
