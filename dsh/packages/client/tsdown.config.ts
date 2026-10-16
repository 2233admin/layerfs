// The browser bundle in dsh's module format, built by dsh's own preset from a
// dsh checkout: ../../../../deepseek-harness by default, or DSH_SOURCE. The
// checkout must be at a version inside engines.dsh.
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const source = process.env.DSH_SOURCE ?? resolve(import.meta.dirname, '../../../../deepseek-harness')
const { clientBundle } = await import(pathToFileURL(resolve(source, 'packages/client/tsdown.client.ts')).href)

export default clientBundle(import.meta.dirname, ['src/index.js'])
