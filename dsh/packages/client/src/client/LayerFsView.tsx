// The LayerFS tab: the root session's SDK calls, replayed into the shared
// view (@dsh-layerfs/view), as the design preview draws a trace. It follows
// the Host's /layerfs/session route while it is shown, and plays new calls
// one at a time, each kept on screen for a while (playback.ts).
import { useEffect, useRef, useState } from 'react'
import FM from '../../../../../sdk_sim/simulation_engine/files.js'
import M from '../../../../../sdk_sim/simulation_engine/model.js'
import * as X from '../../../model/src/index.js'
import { createView, injectStyle } from '../../../view/src/index.js'
import { api, type SessionView } from './api.ts'
import { AVATARS } from './avatars.ts'
import { Setup } from './Setup.tsx'
import type { Directories } from './InitDialog.tsx'
import { Playback, SPEEDS, speedLabel, type Speed, type Step } from './playback.ts'
import { demoApi } from './demo.ts'
import { treeLoader, type TreeCache } from './replay.ts'
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

export function LayerFsView({ sessionId, directories }: { sessionId: string, directories: () => Directories | undefined }) {
  const anchor = useRef<HTMLDivElement>(null)
  useHiddenComposer(anchor)
  return <div ref={anchor} style={{ display: 'contents' }}><TabBody sessionId={sessionId} directories={directories} /></div>
}

function TabBody({ sessionId, directories }: { sessionId: string, directories: () => Directories | undefined }) {
  const { view, error, refresh } = useSessionView(sessionId)
  if (!view) return <div style={MESSAGE}>{error ? `LayerFS is not available: ${error}` : 'Loading LayerFS…'}</div>
  if (!view.project) return <Setup sessionId={sessionId} view={view} onChange={refresh} directories={directories} />
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

// the playback speed, kept in this browser (playback.ts): a demo's Session
// starts at the demo's own speed and keeps its own choice
const SPEED_KEY = 'layerfs-playback-speed'
function savedSpeed(key = SPEED_KEY, fallback: Speed = 1): Speed {
  try {
    const saved = localStorage.getItem(key), n = Number(saved)
    return saved !== null && (SPEEDS as readonly number[]).includes(n) ? n as Speed : fallback
  } catch { return fallback }
}

function Board({ sessionId, view, error }: { sessionId: string, view: SessionView, error: string | null }) {
  const host = useRef<HTMLDivElement>(null)
  const board = useRef<any>(null)
  const trees = useRef<TreeCache>(new Map())
  const play = useRef<{ playback: Playback, agents: string } | null>(null)
  const speed = useRef<Speed>(savedSpeed())
  const latest = useRef(view)
  latest.current = view

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
    // the speed button, before Follow: 1× 2× 4× Max
    const button = document.createElement('button')
    button.className = 'ib'
    const label = () => {
      button.textContent = speedLabel(speed.current)
      button.title = speed.current ? `Playback ${speedLabel(speed.current)}: each call stays on screen for its minimum time${speed.current > 1 ? ` ÷ ${speed.current}` : ''} · click for faster` : 'Playback Max: each call shows as it lands · click for 1×'
    }
    label()
    let key = SPEED_KEY, picked = false
    button.onclick = () => {
      picked = true
      speed.current = SPEEDS[(SPEEDS.indexOf(speed.current) + 1) % SPEEDS.length]
      try { localStorage.setItem(key, String(speed.current)) } catch { /* the speed lasts this tab only */ }
      label()
      play.current?.playback.nudge()
    }
    root.querySelector('[data-follow]')?.before(button)
    demoApi.info().then((info) => {
      const demo = info?.demos.find((d) => d.sessionId === sessionId)
      if (!demo || picked) return
      key = `${SPEED_KEY}:${demo.id}`
      speed.current = savedSpeed(key, demo.speed as Speed)
      label()
      play.current?.playback.nudge()
    }).catch(() => { /* not the demo workspace */ })
    return () => {
      clearTimeout(soon)
      play.current?.playback.stop()
      play.current = null
      unfollow()
      board.current.dispose()
      board.current = null
    }
  }, [sessionId])

  // new lines queue on the playback; older ones show at once when the tab opens
  useEffect(() => {
    const b = board.current
    if (!b) return
    const agents = Object.values(view.agents).join(',')
    let opening = false
    if (!play.current || play.current.agents !== agents) {
      // a rebuild (the tab opened, or an agent was named): labels follow call order;
      // what the old playback already played is applied at once, not played again
      const shown = play.current?.playback.done
      play.current?.playback.stop()
      opening = true
      const fresh = () => {
        const engine: any = new X.ReplayEngine({ project: view.project?.name ?? 'project', loadTree: treeLoader(sessionId, trees.current) })
        engine.onchange = () => b.rerender()
        return X.storyView(engine, { lead: 'main' })
      }
      const playback: Playback = new Playback(fresh, (W, step) => show(b, W, step, playback), () => speed.current, shown)
      play.current = { playback, agents }
    }
    const lines = view.lines.map((line) => ({ ...line, agent: view.agents[line.agentId] ?? line.agent }))
    const playback = play.current.playback
    playback.feed(lines, 'main', opening).catch((e: Error) => { b.note = `The calls could not be replayed: ${e.message}` })
    if (!opening && !playback.waiting && b.W) { b.acting = runningAgents(view); b.note = noteOf(view, playback); b.render() }
  }, [view, sessionId])

  /** Draws the model after a step (its agent acting, the view following it) or once caught up. */
  function show(b: any, W: any, step: Step | null, playback: Playback) {
    if (board.current !== b) return
    const v = latest.current
    b.avatar('main')
    if (step) b.avatar(step.a)
    else for (const line of v.lines) b.avatar(v.agents[line.agentId] ?? line.agent)
    b.W = W
    if (step) { b.acting = [step.a]; b.lastLoc = X.locKey(X.where(W, step.a)) } else b.acting = runningAgents(v)
    if (b.follow && W.lastTab) b.active = W.lastTab
    b.note = noteOf(v, playback)
    b.render()
    if (step) b.animate(step.a)
  }

  useEffect(() => { if (board.current && error) board.current.note = `LayerFS is not answering: ${error}` }, [error])

  return <div ref={host} style={BAND} />
}

const runningAgents = (view: SessionView) => view.running.map((line) => view.agents[line.agentId] ?? line.agent)
const noteOf = (view: SessionView, playback: Playback) => `${view.project!.name} · ${view.lines.length} calls`
  + (playback.waiting ? ` · ${playback.waiting} to play` : '') + (view.running.length ? ` · ${view.running.length} running` : '')
