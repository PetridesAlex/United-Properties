import type {StructureResolver} from 'sanity/structure'

const HIDDEN_TYPES = new Set(['property', 'development', 'bazarakiSettings', 'media.tag'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Bazaraki integration')
        .id('bazarakiSettingsSingleton')
        .child(
          S.document().schemaType('bazarakiSettings').documentId('bazarakiSettings').title('Bazaraki integration'),
        ),
      S.divider(),
      S.listItem()
        .title('Properties')
        .schemaType('property')
        .child(S.documentTypeList('property').title('All Properties')),
      S.listItem()
        .title('Featured Properties')
        .schemaType('property')
        .child(
          S.documentList().title('Featured Properties').filter('_type == "property" && featured == true'),
        ),
      S.listItem()
        .title('For Sale')
        .schemaType('property')
        .child(S.documentList().title('For Sale').filter('_type == "property" && status == "for-sale"')),
      S.listItem()
        .title('For Rent')
        .schemaType('property')
        .child(S.documentList().title('For Rent').filter('_type == "property" && status == "for-rent"')),
      S.listItem()
        .title('Bazaraki feed (flagged)')
        .schemaType('property')
        .child(
          S.documentList()
            .title('Include in Bazaraki XML')
            .filter('_type == "property" && publishToBazaraki == true'),
        ),
      S.divider(),
      S.listItem()
        .title('Developments')
        .schemaType('development')
        .child(S.documentTypeList('development').title('All Developments')),
      ...S.documentTypeListItems().filter((item) => !HIDDEN_TYPES.has(item.getId() ?? '')),
    ])
