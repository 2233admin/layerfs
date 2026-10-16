// What the LayerFS page says about a project's Store (api.projectStorage):
// the headline tiles, and the figures the details drawer lays out.
import type { Storage } from './api.ts'

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB']

/** Bytes in the largest unit under 1024, to three significant digits. */
export function bytes(n: number) {
  let value = n, unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) { value /= 1024; unit++ }
  return unit === 0 ? `${n} B` : `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${UNITS[unit]}`
}

/** ×n, to one decimal below 10. */
export const times = (n: number) => `×${n.toFixed(n >= 10 ? 0 : 1)}`

/** How many times over the Store's file the history's plain files would fill; null when it saves nothing. */
export function saved(z: Storage) {
  const n = z.store.file > 0 ? z.store.logical / z.store.file : 0
  return n > 1 ? n : null
}

/** The storage tiles: [label, value, title]. Saved shows only when the Store is smaller than its history. */
export function storageTiles(z: Storage): [string, string, string][] {
  const { store } = z, last = z.commits[0], gain = saved(z)
  return [
    ['On disk', bytes(store.file), `The Store's database is ${bytes(store.file)}${store.free ? `, ${bytes(store.free)} of it free pages` : ''}. Its write-ahead log is not counted.`],
    ...(gain ? [['Saved', times(gain), `Every saved version as plain files would be ${bytes(store.logical)}; the Store keeps them in ${bytes(store.file)}.`] as [string, string, string]] : []),
    last
      ? ['Last Commit', `+${bytes(last.newStored)}`, `${last.message ?? 'A Commit'} added ${bytes(last.newStored)} of packs (${bytes(last.newCanonical)} of new content before compression).`]
      : ['Last Commit', 'None yet', 'No Branch has a Commit yet.'],
  ]
}
