import type {BazarakiAttrs} from './mapPropertyToListItem'
import type {BazarakiListItem} from './mapPropertyToListItem'

/** Escape XML special chars (needed for image URLs with & query params). */
function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function renderGeometry(item: BazarakiListItem): string {
  if (item.latitude != null && item.longitude != null) {
    return `<geometry>
<latitude>${item.latitude}</latitude>
<longitude>${item.longitude}</longitude>
</geometry>`
  }
  return '<geometry></geometry>'
}

function renderImages(urls: string[]): string {
  if (!urls.length) return '<images></images>'
  const items = urls.map((url) => `<list-item>${escapeXml(url)}</list-item>`).join('\n')
  return `<images>
${items}
</images>`
}

function optionalTag(name: string, value: string | number | null | undefined): string {
  if (value == null || value === '') return ''
  const rendered = typeof value === 'string' ? escapeXml(value) : value
  return `<${name}>${rendered}</${name}>`
}

function renderAttrs(attrs: BazarakiAttrs): string {
  switch (attrs.schema) {
    case 'houses':
      return `<attrs>
<air-conditioning>${attrs.airConditioning}</air-conditioning>
<area>${attrs.area}</area>
${optionalTag('construction-year', attrs.constructionYear)}
<energy-efficiency>${attrs.energyEfficiency}</energy-efficiency>
${optionalTag('furnishing', attrs.furnishing)}
${optionalTag('must-haves', attrs.mustHaves)}
${optionalTag('number-of-bathrooms', attrs.bathrooms)}
<number-of-bedrooms>${attrs.bedrooms}</number-of-bedrooms>
<online-viewing>${attrs.onlineViewing}</online-viewing>
<parking>${attrs.parking}</parking>
<pets>${attrs.pets}</pets>
${optionalTag('plot-area', attrs.plotArea)}
<postalcode>${attrs.postalcode}</postalcode>
<type>${attrs.type}</type>
</attrs>`

    case 'apartment':
      return `<attrs>
<air-conditioning>${attrs.airConditioning}</air-conditioning>
<area>${attrs.area}</area>
${optionalTag('construction-year', attrs.constructionYear)}
<energy-efficiency>${attrs.energyEfficiency}</energy-efficiency>
${optionalTag('floor', attrs.floor)}
${optionalTag('furnishing', attrs.furnishing)}
${optionalTag('must-haves', attrs.mustHaves)}
${optionalTag('number-of-bathrooms', attrs.bathrooms)}
<number-of-bedrooms>${attrs.bedrooms}</number-of-bedrooms>
<online-viewing>${attrs.onlineViewing}</online-viewing>
<parking>${attrs.parking}</parking>
<pets>${attrs.pets}</pets>
<postalcode>${attrs.postalcode}</postalcode>
<type>${attrs.type}</type>
</attrs>`

    case 'residentialBuildings':
      return `<attrs>
${optionalTag('condition', attrs.condition)}
${optionalTag('construction-year', attrs.constructionYear)}
<energy-efficiency>${attrs.energyEfficiency}</energy-efficiency>
<floor-area>${attrs.floorArea}</floor-area>
${optionalTag('must-haves', attrs.mustHaves)}
<online-viewing>${attrs.onlineViewing}</online-viewing>
${optionalTag('plot-area', attrs.plotArea)}
<postalcode>${attrs.postalcode}</postalcode>
${optionalTag('registration-block', attrs.registrationBlock)}
${optionalTag('registration-number', attrs.registrationNumber)}
</attrs>`

    case 'commercial':
      return `<attrs>
<area>${attrs.area}</area>
${optionalTag('construction-year', attrs.constructionYear)}
<energy-efficiency>${attrs.energyEfficiency}</energy-efficiency>
${optionalTag('must-haves', attrs.mustHaves)}
<online-viewing>${attrs.onlineViewing}</online-viewing>
${optionalTag('plot-area', attrs.plotArea)}
<postalcode>${attrs.postalcode}</postalcode>
<type>${attrs.type}</type>
</attrs>`

    case 'prefabricatedHouses':
      return `<attrs>
<postalcode>${attrs.postalcode}</postalcode>
</attrs>`

    case 'other':
      return `<attrs>
${optionalTag('area', attrs.area)}
<condition>${attrs.condition}</condition>
<postalcode>${attrs.postalcode}</postalcode>
</attrs>`

    case 'plotsOfLand':
      return `<attrs>
${optionalTag('coverage', attrs.coverage)}
${optionalTag('density', attrs.density)}
<land-type>${attrs.landType}</land-type>
<online-viewing>${attrs.onlineViewing}</online-viewing>
${optionalTag('parcel-number', attrs.parcelNumber)}
${optionalTag('planning-zone', attrs.planningZone)}
<plot-area>${attrs.plotArea}</plot-area>
<plot-type>${attrs.plotType}</plot-type>
<postalcode>${attrs.postalcode}</postalcode>
${optionalTag('registration-block', attrs.registrationBlock)}
${optionalTag('registration-number', attrs.registrationNumber)}
${optionalTag('share', attrs.share)}
</attrs>`
  }
}

function renderListItem(item: BazarakiListItem): string {
  return `<list-item>
<last_update>${item.lastUpdate}</last_update>
<external_id>${item.externalId}</external_id>
${renderImages(item.imageUrls)}
<status>${item.status}</status>
<rubric>${item.rubric}</rubric>
<district>${item.district}</district>
<description>${item.description}</description>
<price>${item.price}</price>
<phone_hide>${item.phoneHide}</phone_hide>
<negotiable_price>${item.negotiablePrice}</negotiable_price>
<exchange>${item.exchange}</exchange>
${renderAttrs(item.attrs)}
${renderGeometry(item)}
<title>${escapeXml(item.title)}</title>
<whatsapp>${escapeXml(item.whatsapp)}</whatsapp>
</list-item>`
}

export function generateBazarakiXml(items: BazarakiListItem[]): string {
  const body = items.map(renderListItem).join('\n')
  return `<?xml version="1.0" encoding="utf-8"?>
<root>
${body}
</root>`
}

export function generateEmptyBazarakiXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<root>
</root>`
}
