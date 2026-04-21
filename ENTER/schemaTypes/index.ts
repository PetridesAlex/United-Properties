import {inquiryNoteType} from './objects/inquiryNote'
import {socialLinkType} from './objects/socialLink'
import {agentType} from './documents/agent'
import {cityType} from './documents/city'
import {inquiryType} from './documents/inquiry'
import {mediaCleanupHelpType} from './documents/mediaCleanupHelp'
import {propertyType} from './documents/property'
import {siteSettingsType} from './documents/siteSettings'
import {testimonialType} from './documents/testimonial'

export const schemaTypes = [
  inquiryNoteType,
  socialLinkType,
  cityType,
  agentType,
  propertyType,
  inquiryType,
  testimonialType,
  siteSettingsType,
  mediaCleanupHelpType,
]
