import {createClient} from '@sanity/client'

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || 'd7j11dpu'
const SANITY_DATASET = process.env.SANITY_DATASET || 'production'
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || '2024-01-01'
const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function cleanText(value, max = 2000) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function validatePayload(raw) {
  const fullName = cleanText(raw?.fullName, 120)
  const email = cleanText(raw?.email, 180).toLowerCase()
  const phone = cleanText(raw?.phone, 60)
  const subject = cleanText(raw?.subject, 200)
  const propertyLabel = cleanText(raw?.property, 200)
  const preferredContact = cleanText(raw?.preferredContact, 40)
  const message = cleanText(raw?.message, 4000)
  const honeypot = cleanText(raw?.website, 120)

  if (honeypot) return {error: 'Spam check failed'}
  if (!fullName) return {error: 'Full name is required'}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {error: 'Valid email is required'}
  if (!message) return {error: 'Message is required'}

  return {
    value: {
      fullName,
      email,
      phone: phone || undefined,
      subject,
      propertyLabel,
      preferredContact,
      message,
    },
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    return json(res, 405, {ok: false, error: 'Method not allowed'})
  }

  if (!SANITY_API_WRITE_TOKEN) {
    return json(res, 500, {
      ok: false,
      error: 'Server is missing SANITY_API_WRITE_TOKEN',
    })
  }

  const parsed = validatePayload(req.body || {})
  if (parsed.error) {
    return json(res, 400, {ok: false, error: parsed.error})
  }

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token: SANITY_API_WRITE_TOKEN,
    useCdn: false,
  })

  const {fullName, email, phone, subject, propertyLabel, preferredContact, message} = parsed.value

  const composedMessage = [
    subject ? `Subject: ${subject}` : '',
    propertyLabel ? `Interested property: ${propertyLabel}` : '',
    preferredContact ? `Preferred contact: ${preferredContact}` : '',
    '',
    message,
  ]
    .filter(Boolean)
    .join('\n')
    .trim()

  try {
    const created = await client.create({
      _type: 'inquiry',
      fullName,
      email,
      phone,
      message: composedMessage,
      inquiryType: 'general',
      status: 'new',
      priority: 'medium',
      source: 'website_form',
      createdAt: new Date().toISOString(),
    })

    return json(res, 201, {ok: true, id: created?._id})
  } catch (error) {
    console.error('Failed to create Sanity inquiry', error)
    return json(res, 500, {ok: false, error: 'Failed to create inquiry'})
  }
}
