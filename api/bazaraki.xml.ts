import {buildBazarakiFeedXml} from '../src/lib/integrations/bazaraki/buildFeed'

export default async function handler(
  _req: {method?: string},
  res: {
    setHeader: (name: string, value: string) => void
    status: (code: number) => {send: (body: string) => void}
  },
) {
  try {
    const {xml} = await buildBazarakiFeedXml()
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.status(200).send(xml)
  } catch (err) {
    console.error('[bazaraki.xml]', err)
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.status(500).send(`<?xml version="1.0" encoding="utf-8"?><root></root>`)
  }
}
