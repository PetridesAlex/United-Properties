import * as esbuild from 'esbuild'
import {mkdirSync} from 'node:fs'

mkdirSync('api', {recursive: true})

await esbuild.build({
  entryPoints: ['src/server/bazarakiXmlRoute.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'api/_bazaraki-feed.mjs',
  logLevel: 'info',
})

console.log('Built api/_bazaraki-feed.mjs')
