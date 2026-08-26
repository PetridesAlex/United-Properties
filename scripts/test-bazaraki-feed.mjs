/**
 * Smoke tests for Bazaraki formatters and XML generation.
 * Run: node scripts/test-bazaraki-feed.mjs
 */
import {escapeBazarakiDescription, formatBazarakiPrice, formatBazarakiTitle} from '../src/lib/integrations/bazaraki/formatters.ts'
import {generateBazarakiXml} from '../src/lib/integrations/bazaraki/generateBazarakiXml.ts'

let passed = 0
let failed = 0

function assert(name, condition) {
  if (condition) {
    passed += 1
    console.log(`✓ ${name}`)
  } else {
    failed += 1
    console.error(`✗ ${name}`)
  }
}

assert('escapes description entities', escapeBazarakiDescription("Tom & Jerry's \"home\"") === 'Tom &amp; Jerry&apos;s &quot;home&quot;')
assert('formats price', formatBazarakiPrice(900) === '900.00')
assert('truncates long title', formatBazarakiTitle('A'.repeat(80)).length <= 70)

const villaSaleXml = generateBazarakiXml([
  {
    lastUpdate: '2026-08-26 23:00:00',
    externalId: 'villa-sale',
    imageUrls: ['https://example.com/1.jpg'],
    status: 'active',
    rubric: 678,
    district: 5459,
    description: 'Test villa',
    price: '900000.00',
    phoneHide: 0,
    negotiablePrice: 0,
    exchange: 0,
    attrsSchema: 'houses',
    attrs: {
      schema: 'houses',
      airConditioning: 1,
      area: 220,
      constructionYear: 2018,
      energyEfficiency: 20,
      furnishing: 3,
      mustHaves: '1,2',
      bathrooms: 2,
      bedrooms: 4,
      onlineViewing: 20,
      parking: 2,
      pets: 2,
      plotArea: 450,
      postalcode: '4152',
      type: 9,
    },
    latitude: 34.7,
    longitude: 33.0,
    title: 'Test villa Limassol',
    whatsapp: '',
  },
])

assert('villa sale rubric 678', villaSaleXml.includes('<rubric>678</rubric>'))
assert('villa sale type 9', villaSaleXml.includes('<type>9</type>'))
assert('villa sale area', villaSaleXml.includes('<area>220</area>'))
assert('villa sale no pool tag', !villaSaleXml.includes('<pool>'))

const apartmentXml = generateBazarakiXml([
  {
    lastUpdate: '2026-08-26 23:00:00',
    externalId: 'apt-rent',
    imageUrls: ['https://example.com/1.jpg'],
    status: 'active',
    rubric: 3529,
    district: 5459,
    description: 'Test apartment',
    price: '900.00',
    phoneHide: 0,
    negotiablePrice: 0,
    exchange: 0,
    attrsSchema: 'apartment',
    attrs: {
      schema: 'apartment',
      airConditioning: 1,
      area: 90,
      constructionYear: 2020,
      energyEfficiency: 10,
      floor: 20,
      furnishing: 1,
      mustHaves: '4,7',
      bathrooms: 1,
      bedrooms: 2,
      onlineViewing: 10,
      parking: 1,
      pets: 1,
      postalcode: '4152',
      type: 5,
    },
    latitude: null,
    longitude: null,
    title: 'Test apartment',
    whatsapp: '',
  },
])

assert('apartment rent rubric 3529', apartmentXml.includes('<rubric>3529</rubric>'))
assert('apartment type 5', apartmentXml.includes('<type>5</type>'))
assert('apartment floor', apartmentXml.includes('<floor>20</floor>'))

const prefabXml = generateBazarakiXml([
  {
    lastUpdate: '2026-08-26 23:00:00',
    externalId: 'prefab',
    imageUrls: ['https://example.com/1.jpg'],
    status: 'active',
    rubric: 3303,
    district: 5459,
    description: 'Prefab',
    price: '150000.00',
    phoneHide: 0,
    negotiablePrice: 0,
    exchange: 0,
    attrsSchema: 'prefabricatedHouses',
    attrs: {schema: 'prefabricatedHouses', postalcode: '4152'},
    latitude: null,
    longitude: null,
    title: 'Prefab home',
    whatsapp: '',
  },
])

assert('prefab rubric 3303', prefabXml.includes('<rubric>3303</rubric>'))
assert('prefab postal only', prefabXml.includes('<postalcode>4152</postalcode>'))
assert('prefab no area tag', !prefabXml.includes('<area>'))

const otherXml = generateBazarakiXml([
  {
    lastUpdate: '2026-08-26 23:00:00',
    externalId: 'other',
    imageUrls: ['https://example.com/1.jpg'],
    status: 'active',
    rubric: 142,
    district: 5459,
    description: 'Other listing',
    price: '50000.00',
    phoneHide: 0,
    negotiablePrice: 0,
    exchange: 0,
    attrsSchema: 'other',
    attrs: {schema: 'other', area: 100, condition: 20, postalcode: '4152'},
    latitude: null,
    longitude: null,
    title: 'Other property',
    whatsapp: '',
  },
])

assert('other rubric 142', otherXml.includes('<rubric>142</rubric>'))
assert('other condition', otherXml.includes('<condition>20</condition>'))

const landSaleXml = generateBazarakiXml([
  {
    lastUpdate: '2026-08-26 23:00:00',
    externalId: 'land-sale',
    imageUrls: ['https://example.com/1.jpg'],
    status: 'active',
    rubric: 141,
    district: 5459,
    description: 'Land plot',
    price: '250000.00',
    phoneHide: 0,
    negotiablePrice: 0,
    exchange: 0,
    attrsSchema: 'plotsOfLand',
    attrs: {
      schema: 'plotsOfLand',
      coverage: '50%',
      density: '90%',
      landType: 10,
      onlineViewing: 20,
      parcelNumber: '123/45',
      planningZone: 'Ka3',
      plotArea: 500,
      plotType: 20,
      postalcode: '4152',
      registrationBlock: 12,
      registrationNumber: 345,
      share: 20,
    },
    latitude: null,
    longitude: null,
    title: 'Agricultural land',
    whatsapp: '',
  },
])

assert('land sale rubric 141', landSaleXml.includes('<rubric>141</rubric>'))
assert('land sale land-type 10', landSaleXml.includes('<land-type>10</land-type>'))
assert('land sale plot-type 20', landSaleXml.includes('<plot-type>20</plot-type>'))
assert('land sale plot-area', landSaleXml.includes('<plot-area>500</plot-area>'))
assert('land sale density from building_density', landSaleXml.includes('<density>90%</density>'))
assert('land sale no area tag', !landSaleXml.includes('<area>'))

const landRentXml = generateBazarakiXml([
  {
    lastUpdate: '2026-08-26 23:00:00',
    externalId: 'land-rent',
    imageUrls: ['https://example.com/1.jpg'],
    status: 'active',
    rubric: 3530,
    district: 5459,
    description: 'Land to rent',
    price: '500.00',
    phoneHide: 0,
    negotiablePrice: 0,
    exchange: 0,
    attrsSchema: 'plotsOfLand',
    attrs: {
      schema: 'plotsOfLand',
      coverage: null,
      density: null,
      landType: 20,
      onlineViewing: 10,
      parcelNumber: null,
      planningZone: null,
      plotArea: 800,
      plotType: 10,
      postalcode: '4152',
      registrationBlock: null,
      registrationNumber: null,
      share: null,
    },
    latitude: null,
    longitude: null,
    title: 'Residential plot',
    whatsapp: '',
  },
])

assert('land rent rubric 3530', landRentXml.includes('<rubric>3530</rubric>'))
assert('land rent plot-type 10', landRentXml.includes('<plot-type>10</plot-type>'))

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
