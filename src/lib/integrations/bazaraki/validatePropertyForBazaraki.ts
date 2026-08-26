import type {BazarakiValidation, Property, SiteSettings} from '../../../types/cms'
import {isActiveStatus} from '../../../types/cms'
import {mapApartmentType} from './apartmentMappings'
import {mapCommercialType} from './commercialMappings'
import {mapHouseType} from './housesMappings'
import {
  mapLandTypeToBazaraki,
  mapPlotTypeToBazaraki,
  mapShareToBazaraki,
} from './landMappings'
import {
  getRubricCategoryLabel,
  resolveBazarakiRubric,
  resolveRubricCategory,
  type BazarakiRubricSettings,
} from './rubricMappings'
import {
  mapConditionToBazaraki,
  mapEnergyEfficiencyToBazaraki,
  resolveArea,
} from './sharedMappings'
import {formatBazarakiTitle} from './formatters'
import {
  getAttrsSchemaLabel,
  isBazarakiMappableType,
  resolveAttrsSchema,
} from './schemaResolver'

const DEFAULT_RUBRIC_SETTINGS: BazarakiRubricSettings = {
  bazaraki_rubric_apartments_sale: 3528,
  bazaraki_rubric_apartments_rent: 3529,
  bazaraki_rubric_houses_sale: 678,
  bazaraki_rubric_houses_rent: 681,
  bazaraki_rubric_residential_buildings_sale: 2790,
  bazaraki_rubric_prefabricated_houses_sale: 3303,
  bazaraki_rubric_other_sale: 142,
  bazaraki_rubric_other_rent: 3531,
  bazaraki_rubric_commercial_sale: 2405,
  bazaraki_rubric_commercial_rent: 2408,
  bazaraki_rubric_plots_sale: 141,
  bazaraki_rubric_plots_rent: 3530,
}

/**
 * Readiness checks for the Bazaraki XML feed.
 */
export function validatePropertyForBazaraki(
  property: Partial<Property> & {property_images?: {image_url: string}[]},
  settings: Partial<SiteSettings> = DEFAULT_RUBRIC_SETTINGS,
): BazarakiValidation {
  const missingFields: string[] = []
  const errors: string[] = []
  const warnings: string[] = []

  const schema = property.property_type && property.status
    ? resolveAttrsSchema(property.property_type, property.status)
    : null
  const rubricCategory = resolveRubricCategory(property.property_type)
  const rubricId =
    property.property_type && property.status && isActiveStatus(property.status as 'for_sale' | 'for_rent')
      ? resolveBazarakiRubric(property.property_type, property.status, settings)
      : null

  if (!property.title?.trim()) missingFields.push('Title')
  if (!property.property_type?.trim()) missingFields.push('Property type')
  if (property.price == null || Number(property.price) <= 0) missingFields.push('Price')
  if (!property.city?.trim()) missingFields.push('City')
  if (!property.description?.trim() && !property.short_description?.trim()) {
    missingFields.push('Description')
  }

  const images = property.property_images ?? []
  const validImages = images.filter((img) => img.image_url?.trim().startsWith('http'))
  if (!validImages.length) missingFields.push('At least one image with a public URL')

  if (property.publish_to_bazaraki) {
    if (property.bazaraki_district_id == null) {
      missingFields.push('Bazaraki district')
    }
    if (!property.postal_code?.trim()) {
      missingFields.push('Postal code')
    }

    if (property.property_type && property.status) {
      if (!isBazarakiMappableType(property.property_type, property.status)) {
        errors.push(
          `Property type "${property.property_type}" cannot be mapped to Bazaraki for status "${property.status}".`,
        )
      } else if (rubricId == null) {
        errors.push('No Bazaraki rubric is available for this property type and status.')
      }
    }

    if (schema) {
      validateSchemaFields(property, schema, missingFields, warnings, errors)
    }

    if (property.title?.trim()) {
      const formatted = formatBazarakiTitle(property.title)
      if (!formatted) {
        errors.push('Title must contain text or digits after cleaning.')
      } else if (property.title.trim().length > 70) {
        warnings.push('Title will be truncated to 70 characters for Bazaraki.')
      }
    }
  }

  if (!property.published) {
    errors.push('Property must be published on the website before Bazaraki export.')
  }
  if (property.status && !isActiveStatus(property.status)) {
    errors.push('Sold and rented properties are excluded from the active Bazaraki feed.')
  }
  if (property.archived_at) {
    errors.push('Archived properties cannot be published to Bazaraki.')
  }
  if (!property.publish_to_bazaraki) {
    warnings.push('Publish to Bazaraki is turned off for this property.')
  }
  if (!property.address?.trim()) warnings.push('Address is recommended for Bazaraki.')
  if (property.latitude == null || property.longitude == null) {
    warnings.push('Coordinates are recommended for map placement.')
  }

  const ready =
    missingFields.length === 0 &&
    errors.length === 0 &&
    Boolean(property.publish_to_bazaraki) &&
    Boolean(property.published) &&
    Boolean(property.status && isActiveStatus(property.status)) &&
    !property.archived_at &&
    schema != null &&
    rubricId != null

  return {
    ready,
    missingFields,
    errors,
    warnings,
    attrsSchema: schema ? getAttrsSchemaLabel(schema) : null,
    rubricId,
    rubricCategory: rubricCategory ? getRubricCategoryLabel(rubricCategory) : null,
  }
}

function validateSchemaFields(
  property: Partial<Property>,
  schema: NonNullable<ReturnType<typeof resolveAttrsSchema>>,
  missingFields: string[],
  warnings: string[],
  errors: string[],
): void {
  const area = resolveArea(property.internal_area, property.covered_area)
  const energy = mapEnergyEfficiencyToBazaraki(property.energy_efficiency)

  switch (schema) {
    case 'houses': {
      if (area == null) missingFields.push('Area (sqm)')
      if (energy == null) missingFields.push('Energy efficiency')
      if (property.bedrooms == null) missingFields.push('Bedrooms')
      if (mapHouseType(property.property_type, property.bazaraki_house_type) == null) {
        missingFields.push('Bazaraki house type')
      }
      if (property.property_type === 'Holiday Home' && property.bazaraki_house_type == null) {
        warnings.push('Holiday Home defaults to Detached house (type 1) unless Bazaraki house type is set.')
      }
      break
    }
    case 'apartment': {
      if (area == null) missingFields.push('Area (sqm)')
      if (energy == null) missingFields.push('Energy efficiency')
      if (property.bedrooms == null) missingFields.push('Bedrooms')
      if (mapApartmentType(property.property_type) == null) {
        missingFields.push('Apartment type mapping')
      }
      break
    }
    case 'residentialBuildings': {
      if (area == null) missingFields.push('Floor area (sqm)')
      if (energy == null) missingFields.push('Energy efficiency')
      if (mapConditionToBazaraki(property.condition) == null) {
        warnings.push('Condition is recommended for residential buildings.')
      }
      break
    }
    case 'commercial': {
      if (area == null) missingFields.push('Area (sqm)')
      if (energy == null) missingFields.push('Energy efficiency')
      if (mapCommercialType(property.bazaraki_commercial_type) == null) {
        missingFields.push('Commercial type')
      }
      break
    }
    case 'prefabricatedHouses':
      break
    case 'other': {
      if (mapConditionToBazaraki(property.condition) == null) {
        missingFields.push('Condition')
      }
      if (area == null) warnings.push('Area is recommended for Other listings.')
      break
    }
    case 'plotsOfLand': {
      if (property.plot_size == null || property.plot_size <= 0) {
        missingFields.push('Plot size (sqm)')
      }
      if (!property.land_type?.trim()) {
        missingFields.push('Land type')
      } else if (mapLandTypeToBazaraki(property.land_type) == null) {
        errors.push(`Land type "${property.land_type.trim()}" is not a recognised Bazaraki value.`)
      }
      if (!property.plot_type?.trim()) {
        missingFields.push('Plot type')
      } else if (mapPlotTypeToBazaraki(property.plot_type) == null) {
        errors.push(`Plot type "${property.plot_type.trim()}" is not a recognised Bazaraki value.`)
      }
      if (property.share?.trim() && mapShareToBazaraki(property.share) == null) {
        errors.push(`Share "${property.share.trim()}" is not a recognised Bazaraki value.`)
      }
      if (!property.coverage?.trim()) warnings.push('Coverage is recommended for land listings.')
      if (!property.building_density?.trim()) {
        warnings.push('Building density is recommended for land listings.')
      }
      if (!property.planning_zone?.trim()) {
        warnings.push('Planning zone is recommended for land listings.')
      }
      if (!property.parcel_number?.trim()) {
        warnings.push('Parcel number is recommended for land listings.')
      }
      if (!property.share?.trim()) warnings.push('Share is recommended for land listings.')
      if (property.registration_block == null) {
        warnings.push('Registration block is recommended for land listings.')
      }
      if (property.registration_number == null) {
        warnings.push('Registration number is recommended for land listings.')
      }
      break
    }
  }
}
