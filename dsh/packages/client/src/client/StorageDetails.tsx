// The storage drawer under the LayerFS page's tiles: where the Store's bytes
// go (every version as files, distinct content, packed, the database file),
// what Init imported and cost, and what each recent Commit added. Labels
// (C3, L1) are the board's, by real id.
import type { Storage } from './api.ts'
import { bytes, times } from './storage.ts'
import { card, T } from './tokens.ts'

const ago = (ms: number) => {
  const s = Math.max(0, (Date.now() - ms) / 1000)
  return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)} min ago` : s < 86400 ? `${Math.floor(s / 3600)} h ago` : `${Math.floor(s / 86400)} d ago`
}

const heading = { fontSize: 12, fontWeight: 500, color: T.text2 } as const
const PACKS = 'var(--dsw-alias-state-success-primary, #16a34a)'
const CONTENT = 'var(--dsw-alias-state-business-primary, #3b82f6)'
const SQLITE = T.warn
const figure = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const

/** A labelled bar: `parts` are [bytes, colour] stacked from the left, out of `max`. */
function Bar({ label, value, note, parts, max, title }: { label: string, value: number, note?: string, parts: [number, string][], max: number, title: string }) {
  return (
    <div title={title} style={{ display: 'grid', gap: 4 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {note && <span style={{ ...figure, fontSize: 12, color: T.text2 }}>{note}</span>}
        <span style={{ ...figure, fontWeight: 500 }}>{bytes(value)}</span>
      </div>
      <div style={{ display: 'flex', height: 6, borderRadius: 3, background: T.well, overflow: 'hidden' }}>
        {parts.map(([n, colour], i) => <i key={i} style={{ width: `${max > 0 ? (100 * n) / max : 0}%`, background: colour }} />)}
      </div>
    </div>
  )
}

export function StorageDetails({ storage, labels }: { storage: Storage, labels: Record<string, string> }) {
  const { store, init, commits } = storage
  const max = Math.max(store.logical, store.canonical, store.file, 1)
  const other = Math.max(0, store.file - store.stored - store.free)
  const biggest = Math.max(1, ...commits.map((c) => c.newStored))
  return (
    <section aria-label="Storage details" style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, padding: 16 }}>
      <div style={{ display: 'grid', alignContent: 'start', gap: 12 }}>
        <div style={heading}>Where the bytes go</div>
        <Bar label="Every version, as files" value={store.logical} parts={[[store.logical, T.caption]]} max={max}
          title="Each Commit's and Layer's files at full size, counting every hard link: what the history would take as plain copies." />
        <Bar label="Distinct content" value={store.canonical} note={store.dedupe ? `${times(store.dedupe)} dedupe` : undefined} parts={[[store.canonical, CONTENT]]} max={max}
          title="Each distinct file and chunk once, with the directory objects: content shared by versions and Branches is kept once." />
        <Bar label="Packed" value={store.stored} note={store.compression ? `${times(store.compression)} smaller` : undefined} parts={[[store.stored, PACKS]]} max={max}
          title="That content compressed and delta-encoded into packs, including the metadata packs." />
        <Bar label="Database file" value={store.file} parts={[[store.stored, PACKS], [other, SQLITE], [store.free, T.border]]} max={max}
          title={`Packs ${bytes(store.stored)}, SQLite outside the packs ${bytes(other)}, free pages ${bytes(store.free)}. Metadata, counting its packs, is ${bytes(store.metadata)}. The write-ahead log is not counted.`} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, color: T.text2 }}>
          {([[PACKS, `packs ${bytes(store.stored)}`], [SQLITE, `SQLite tables and indexes ${bytes(other)}`], ...(store.free ? [[T.border, `free ${bytes(store.free)}`]] : [])] as [string, string][]).map(([colour, text]) => (
            <span key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: colour }} />{text}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', alignContent: 'start', gap: 12 }}>
        <div style={heading}>Import</div>
        {init
          ? (
            <>
              <div><b style={figure}>{init.entries.toLocaleString()}</b> entries, <b style={figure}>{init.files.toLocaleString()}</b> files, <b style={figure}>{bytes(init.bytes)}</b> in {init.millis < 1000 ? `${init.millis} ms` : `${(init.millis / 1000).toFixed(1)} s`}</div>
              <div style={{ color: T.text2 }}>It left the Store at {bytes(init.stored)} of packs ({bytes(init.canonical)} distinct content) and {bytes(init.metadata)} of metadata.</div>
              <div style={{ color: T.text2 }}>Everything since has added {bytes(Math.max(0, store.stored - init.stored))} of packs.</div>
            </>
          )
          : <div style={{ color: T.text2 }}>Not recorded: this Store was built before LayerFS kept what Init imported.</div>}
        <div style={{ ...heading, marginTop: 4 }}>Not reported</div>
        <div style={{ color: T.caption, fontSize: 12 }}>Bytes only one Branch holds (Branches share content), a file's own share on disk (shared chunks have no single owner), and the write-ahead log.</div>
      </div>

      <div style={{ display: 'grid', alignContent: 'start', gap: 8, minWidth: 0 }}>
        <div style={heading}>{commits.length ? `What the last ${commits.length === 1 ? 'Commit' : `${commits.length} Commits`} added` : 'Commits'}</div>
        {!commits.length && <div style={{ color: T.text2 }}>No Branch has a Commit yet.</div>}
        <div style={{ display: 'grid', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
          {commits.map((c) => (
            <div key={c.id} title={`${c.message ?? 'No message'}: ${bytes(c.newCanonical)} new content, ${bytes(c.newStored)} of new packs (${bytes(c.newMetadata)} metadata); the tree is ${bytes(c.logical)}.`} style={{ display: 'grid', gap: 2 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', minWidth: 0 }}>
                <span style={{ ...figure, fontFamily: 'var(--dsw-font-mono, ui-monospace, monospace)', fontSize: 12 }}>{labels[c.id] ?? c.id.slice(0, 8)}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message ?? 'No message'}</span>
                <span style={{ ...figure, fontSize: 12, color: T.caption }}>{ago(c.time)}</span>
                <span style={{ ...figure, fontWeight: 500 }}>+{bytes(c.newStored)}</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: T.well }}><i style={{ display: 'block', height: '100%', borderRadius: 2, width: `${(100 * c.newStored) / biggest}%`, background: PACKS }} /></div>
            </div>
          ))}
        </div>
        {storage.partial && <div style={{ color: T.caption, fontSize: 12 }}>Only the most recent Commits are listed.</div>}
      </div>
    </section>
  )
}
