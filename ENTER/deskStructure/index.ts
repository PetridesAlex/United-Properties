import type {StructureResolver} from 'sanity/structure'
import {
  CogIcon,
  HomeIcon,
  ImagesIcon,
  MarkerIcon,
  StarIcon,
  TaskIcon,
  UsersIcon,
} from '@sanity/icons'

/** Types managed via custom lists — hide from default duplicate bucket */
export const HIDDEN_FROM_DEFAULT_LIST = new Set([
  'property',
  'inquiry',
  'city',
  'agent',
  'testimonial',
  'siteSettings',
  'mediaCleanupHelp',
  'media.tag',
  'development',
])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('United Properties')
    .items([
      S.listItem()
        .title('Properties')
        .icon(HomeIcon)
        .id('properties-hub')
        .child(
          S.list()
            .title('Properties')
            .items([
              S.listItem()
                .title('All properties')
                .schemaType('property')
                .child(S.documentTypeList('property').title('All properties')),
              S.listItem()
                .title('For sale')
                .id('properties-sale')
                .schemaType('property')
                .child(
                  S.documentList()
                    .title('For sale')
                    .filter('_type == "property" && purpose == "sale"'),
                ),
              S.listItem()
                .title('For rent')
                .id('properties-rent')
                .schemaType('property')
                .child(
                  S.documentList()
                    .title('For rent')
                    .filter('_type == "property" && purpose == "rent"'),
                ),
              S.listItem()
                .title('Featured')
                .id('properties-featured')
                .schemaType('property')
                .child(
                  S.documentList()
                    .title('Featured')
                    .filter('_type == "property" && featured == true'),
                ),
              S.listItem()
                .title('Signature collection')
                .id('properties-signature')
                .schemaType('property')
                .child(
                  S.documentList()
                    .title('Signature collection')
                    .filter('_type == "property" && signature == true'),
                ),
              S.divider(),
              S.listItem()
                .title('Sold / Rented / Reserved')
                .id('properties-closed')
                .schemaType('property')
                .child(
                  S.documentList()
                    .title('Sold / Rented / Reserved')
                    .filter(
                      '_type == "property" && listingStatus in ["sold", "rented", "reserved"]',
                    ),
                ),
            ]),
        ),

      S.listItem()
        .title('Inquiries / CRM')
        .icon(TaskIcon)
        .id('inquiries-hub')
        .child(
          S.list()
            .title('Inquiries / CRM')
            .items([
              S.listItem()
                .title('All leads')
                .schemaType('inquiry')
                .child(S.documentTypeList('inquiry').title('All leads')),
              S.listItem()
                .title('New')
                .id('inquiry-new')
                .schemaType('inquiry')
                .child(
                  S.documentList()
                    .title('New')
                    .filter('_type == "inquiry" && status == "new"'),
                ),
              S.listItem()
                .title('Contacted')
                .id('inquiry-contacted')
                .schemaType('inquiry')
                .child(
                  S.documentList()
                    .title('Contacted')
                    .filter('_type == "inquiry" && status == "contacted"'),
                ),
              S.listItem()
                .title('Follow-up')
                .id('inquiry-follow-up')
                .schemaType('inquiry')
                .child(
                  S.documentList()
                    .title('Follow-up')
                    .filter('_type == "inquiry" && status == "follow_up"'),
                ),
              S.listItem()
                .title('Viewing scheduled')
                .id('inquiry-viewing')
                .schemaType('inquiry')
                .child(
                  S.documentList()
                    .title('Viewing scheduled')
                    .filter('_type == "inquiry" && status == "viewing_scheduled"'),
                ),
              S.listItem()
                .title('Negotiation')
                .id('inquiry-negotiation')
                .schemaType('inquiry')
                .child(
                  S.documentList()
                    .title('Negotiation')
                    .filter('_type == "inquiry" && status == "negotiation"'),
                ),
              S.listItem()
                .title('Closed')
                .id('inquiry-closed')
                .schemaType('inquiry')
                .child(
                  S.documentList()
                    .title('Closed')
                    .filter('_type == "inquiry" && status == "closed"'),
                ),
              S.listItem()
                .title('Lost')
                .id('inquiry-lost')
                .schemaType('inquiry')
                .child(
                  S.documentList()
                    .title('Lost')
                    .filter('_type == "inquiry" && status == "lost"'),
                ),
            ]),
        ),

      S.listItem()
        .title('Agents')
        .icon(UsersIcon)
        .schemaType('agent')
        .child(S.documentTypeList('agent').title('Agents')),

      S.listItem()
        .title('Cities')
        .icon(MarkerIcon)
        .schemaType('city')
        .child(S.documentTypeList('city').title('Cities')),

      S.listItem()
        .title('Testimonials')
        .icon(StarIcon)
        .schemaType('testimonial')
        .child(S.documentTypeList('testimonial').title('Testimonials')),

      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings'),
        ),

      S.divider(),

      S.listItem()
        .title('All uploaded images (list view)')
        .icon(ImagesIcon)
        .id('sanity-image-assets')
        .child(
          S.documentList()
            .title('Image assets')
            .filter('_type == "sanity.imageAsset"')
            .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
            .apiVersion('2024-01-01'),
        ),

      S.listItem()
        .title('Unused images (safe bulk delete)')
        .icon(ImagesIcon)
        .id('sanity-image-assets-unused')
        .child(
          S.documentList()
            .title('Unused image assets')
            .filter('_type == "sanity.imageAsset" && count(*[references(^._id)]) == 0')
            .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
            .apiVersion('2024-01-01'),
        ),

      S.listItem()
        .title('Media cleanup help')
        .id('mediaCleanupHelpSingleton')
        .child(S.document().schemaType('mediaCleanupHelp').documentId('mediaCleanupHelp')),

      S.divider(),

      ...S.documentTypeListItems().filter((item) => !HIDDEN_FROM_DEFAULT_LIST.has(item.getId() ?? '')),
    ])
