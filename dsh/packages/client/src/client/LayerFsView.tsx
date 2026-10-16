// The LayerFS tab: the root session's SDK calls, replayed into the shared
// view (@dsh-layerfs/view), as the design preview draws a trace. It follows
// the Host's /layerfs/session route while it is shown.
import { useEffect, useRef, useState } from 'react'
import FM from '../../../../../sdk_sim/simulation_engine/files.js'
import M from '../../../../../sdk_sim/simulation_engine/model.js'
import * as X from '../../../model/src/index.js'
import { createView, injectStyle } from '../../../view/src/index.js'
import { api, type SessionView } from './api.ts'
import { AVATARS } from './avatars.ts'
import { Setup } from './Setup.tsx'
import { linesKey, replay, treeLoader, type TreeCache } from './replay.ts'
import { MESSAGE } from './ui.ts'
import { useHiddenComposer } from './composer.ts'
import { followTheme } from './theme.ts'

const POLL_MS = 1500

/** The session's view from the Host, read every POLL_MS while the page is visible. */
export function useSessionView(sessionId: string) {
  const [view, setView] = useState<SessionView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let stopped = false, timer: ReturnType<typeof setTimeout> | undefined
    const read = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const next = await api.session(sessionId)
          if (!stopped) { setView(next); setError(null) }
        } catch (e) {
          if (!stopped) setError((e as Error).message)
        }
      }
      if (!stopped) timer = setTimeout(read, POLL_MS)
    }
    void read()
    return () => { stopped = true; clearTimeout(timer) }
  }, [sessionId, tick])
  return { view, error, refresh: (next?: SessionView) => { if (next) setView(next); setTick((n) => n + 1) } }
}

export function LayerFsView({ sessionId }: { sessionId: string }) {
  const anchor = useRef<HTMLDivElement>(null)
  useHiddenComposer(anchor)
  return <div ref={anchor} style={{ display: 'contents' }}><TabBody sessionId={sessionId} /></div>
}

function TabBody({ sessionId }: { sessionId: string }) {
  const { view, error, refresh } = useSessionView(sessionId)
  if (!view) return <div style={MESSAGE}>{error ? `LayerFS is not available: ${error}` : 'Loading LayerFS…'}</div>
  if (!view.project) return <Setup sessionId={sessionId} view={view} onChange={refresh} />
  if (!view.lines.length) {
    return (
      <div style={MESSAGE}>
        <b>{view.project.name}</b> · no LayerFS calls in this session yet.
        {view.running.length ? ' A call is running…' : ' Calls show here as the agents make them.'}
      </div>
    )
  }
  return <Board sessionId={sessionId} view={view} error={error} />
}

// The band of the conversation's scroll body that the composer leaves
// visible (dsh publishes both heights on the scroll body).
const BAND = { height: 'calc(var(--dsh-conversation-viewport-height, 100vh) - var(--dsh-composer-height, 0px))', minHeight: 320, position: 'relative' } as const

function Board({ sessionId, view, error }: { sessionId: string, view: SessionView, error: string | null }) {
  const host = useRef<HTMLDivElement>(null)
  const board = useRef<any>(null)
  const trees = useRef<TreeCache>(new Map())
  const shown = useRef<string | null>(null)
  const generation = useRef(0)

  // the view lives as long as the tab; dsh's colour scheme sets its theme
  useEffect(() => {
    injectStyle(document)
    const root = host.current!
    let soon: ReturnType<typeof setTimeout> | undefined
    board.current = createView(root, {
      avatars: AVATARS, files: FM, lineDiff: M.lineDiff, live: false, lead: 'main',
      hint: 'hover a History node · F follow',
    })
    const unfollow = followTheme(root)
    board.current.rerender = () => { clearTimeout(soon); soon = setTimeout(() => board.current?.W && board.current.render(), 40) }
    return () => {
      clearTimeout(soon)
      unfollow()
      board.current.dispose()
      board.current = null
      shown.current = null
    }
  }, [sessionId])

  // a new line rebuilds the model from all lines (labels follow call order)
  useEffect(() => {
    const b = board.current, key = linesKey(view)
    if (!b) return
    b.acting = view.running.map((line) => view.agents[line.agentId] ?? line.agent)
    if (key === shown.current) { if (b.W) b.render(); return }
    const mine = ++generation.current, first = shown.current === null
    shown.current = key
    void replay(view, treeLoader(sessionId, trees.current), () => b.rerender()).then(({ W, last, agents }) => {
      if (mine !== generation.current || board.current !== b) return
      for (const name of ['main', ...agents]) b.avatar(name)
      b.W = W
      b.lastLoc = last ? X.locKey(X.where(W, last.a)) : null
      if (b.follow && W.lastTab) b.active = W.lastTab
      b.note = `${view.project!.name} · ${view.lines.length} calls${view.running.length ? ` · ${view.running.length} running` : ''}`
      b.render()
      if (!first && last) b.animate(last.a)
    }, (e: Error) => { b.note = `The calls could not be replayed: ${e.message}` })
  }, [view, sessionId])

  useEffect(() => { if (board.current && error) board.current.note = `LayerFS is not answering: ${error}` }, [error])

  return <div ref={host} style={BAND} />
}
