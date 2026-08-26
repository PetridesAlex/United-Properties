import {buildBazarakiFeedXml} from '../lib/integrations/bazaraki/buildFeed'

const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=300',
}

export default async function handler(
  _req: {method?: string},
  res: {
    setHeader: (name: string, value: string) => void
    status: (code: number) => {send: (body: string) => void}
  },
) {
  try {
    const {xml} = await buildBazarakiFeedXml()
    res.setHeader('Content-Type', XML_HEADERS['Content-Type'])
    res.setHeader('Cache-Control', XML_HEADERS['Cache-Control'])
    res.status(200).send(xml)
  } catch (err) {
    console.error('[bazaraki.xml]', err)
    res.setHeader('Content-Type', XML_HEADERS['Content-Type'])
    res.status(500).send(`<?xml version="1.0" encoding="utf-8"?><root></root>`)
  }
}
