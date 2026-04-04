import {defineField, defineType} from 'sanity'

/**
 * Single “integration” doc (id: bazarakiSettings) — URLs & defaults for XML export / automation.
 * Does not replace per-listing rubric/district; editors still set those on each property.
 */
export const bazarakiSettingsType = defineType({
  name: 'bazarakiSettings',
  title: 'Bazaraki integration',
  type: 'document',
  fields: [
    defineField({
      name: 'publicSiteUrl',
      title: 'Public website URL',
      description:
        'Base URL for image URLs and item links in the XML feed (e.g. https://unitedproperties.eu). Must match where the XML is hosted.',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'xmlFeedPath',
      title: 'XML feed path (planned)',
      description:
        'Relative path on your server for the XML file (e.g. /feeds/bazaraki.xml). Used when building automation; Bazaraki will poll this URL hourly.',
      type: 'string',
      placeholder: '/feeds/bazaraki.xml',
    }),
    defineField({
      name: 'businessGuideUrl',
      title: 'Bazaraki business XML guide',
      type: 'url',
      initialValue: 'https://www.bazaraki.com/business-xml-guide/',
    }),
    defineField({
      name: 'locationsJsonUrl',
      title: 'Locations / districts JSON',
      type: 'url',
      initialValue: 'https://www.bazaraki.com/api/items/all_cities_districts/',
    }),
    defineField({
      name: 'defaultRubricForRent',
      title: 'Default rubric ID (rent)',
      description:
        'Example: 682 = Real estate / Houses, apartments to rent / Owner. Confirm in the business guide.',
      type: 'number',
      initialValue: 682,
    }),
    defineField({
      name: 'defaultRubricForSale',
      title: 'Default rubric ID (sale)',
      description: 'Pick the correct sale category ID from the business guide for your listings.',
      type: 'number',
    }),
    defineField({
      name: 'notes',
      title: 'Internal notes',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    prepare: () => ({title: 'Bazaraki integration'}),
  },
})
