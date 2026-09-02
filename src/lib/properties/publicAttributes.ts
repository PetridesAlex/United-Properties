import {BAZARAKI_MUST_HAVE_LABELS} from '../integrations/bazaraki/sharedMappings'
import type {PublicPropertyCard} from '../../types/cms'

const AIR_CONDITIONING_LABELS: Record<number, string> = {
  1: 'Full, all rooms',
  2: 'Partly',
  3: 'No',
}

const PARKING_TYPE_LABELS: Record<number, string> = {
  1: 'Covered',
  2: 'Uncovered',
  3: 'No',
}

const PETS_LABELS: Record<number, string> = {
  1: 'Allowed',
  2: 'Not allowed',
}

export type PropertyAttributeRow = {
  label: string
  value: string
}

function formatSquareMeterPrice(price: number, sqm: number): string | null {
  if (!Number.isFinite(price) || !Number.isFinite(sqm) || sqm <= 0 || price <= 0) return null
  const perSqm = Math.round(price / sqm)
  return `€${perSqm.toLocaleString('de-DE')} /m²`
}

/** Bazaraki-style attribute rows for the public property page. */
export function buildPublicPropertyAttributes(property: PublicPropertyCard): {
  facts: PropertyAttributeRow[]
  meta: PropertyAttributeRow[]
} {
  const facts: PropertyAttributeRow[] = []
  const meta: PropertyAttributeRow[] = []

  if (property.onlineViewing != null) {
    facts.push({label: 'Online viewing', value: property.onlineViewing ? 'Yes' : 'No'})
  }

  if (property.airConditioning != null && AIR_CONDITIONING_LABELS[property.airConditioning]) {
    facts.push({
      label: 'Air conditioning',
      value: AIR_CONDITIONING_LABELS[property.airConditioning],
    })
  }

  if (property.yearBuilt != null) {
    facts.push({label: 'Construction year', value: String(property.yearBuilt)})
  }

  if (property.energyEfficiency?.trim()) {
    facts.push({label: 'Energy Efficiency', value: property.energyEfficiency.trim()})
  }

  if (property.bedrooms != null && property.bedrooms > 0) {
    facts.push({label: 'Bedrooms', value: String(property.bedrooms)})
  }

  if (property.bathrooms != null && property.bathrooms > 0) {
    facts.push({label: 'Bathrooms', value: String(property.bathrooms)})
  }

  if (property.sqm != null && property.sqm > 0) {
    facts.push({label: 'Area', value: `${property.sqm} m²`})
  }

  const sqmPrice = formatSquareMeterPrice(property.price, property.sqm)
  if (sqmPrice && property.status !== 'For Rent') {
    facts.push({label: 'Square meter price', value: sqmPrice})
  }

  if (property.floor != null) {
    facts.push({label: 'Floor', value: property.floor === 0 ? 'Ground floor' : String(property.floor)})
  }

  if (property.floorsTotal != null) {
    facts.push({label: 'Total floors', value: String(property.floorsTotal)})
  }

  if (property.parkingType != null && PARKING_TYPE_LABELS[property.parkingType]) {
    facts.push({label: 'Parking', value: PARKING_TYPE_LABELS[property.parkingType]})
  } else if (property.parking != null && property.parking > 0) {
    facts.push({
      label: 'Parking',
      value: `${property.parking} space${property.parking === 1 ? '' : 's'}`,
    })
  }

  if (property.pets != null && PETS_LABELS[property.pets]) {
    facts.push({label: 'Pets', value: PETS_LABELS[property.pets]})
  }

  if (property.condition?.trim()) {
    facts.push({label: 'Condition', value: property.condition.trim()})
  }

  if (property.registrationBlock != null) {
    facts.push({label: 'Registration block', value: String(property.registrationBlock)})
  }

  if (property.registrationNumber != null) {
    facts.push({label: 'Registration number', value: String(property.registrationNumber)})
  }

  if (property.postalCode?.trim()) {
    facts.push({label: 'Postal code', value: property.postalCode.trim()})
  }

  if (property.mustHaves?.length) {
    const labels = property.mustHaves
      .map((id) => BAZARAKI_MUST_HAVE_LABELS[id])
      .filter(Boolean)
    if (labels.length) {
      facts.push({label: 'Included', value: labels.join(', ')})
    }
  }

  if (property.referenceId?.trim()) {
    meta.push({label: 'Reference number', value: property.referenceId.trim()})
  }

  if (property.type?.trim()) {
    meta.push({label: 'Type', value: property.type.trim()})
  }

  if (property.furnishing?.trim()) {
    meta.push({label: 'Furnishing', value: property.furnishing.trim()})
  }

  return {facts, meta}
}
