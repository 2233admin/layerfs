// A project's History and Files, drawn by the shared view in project mode
// from the project's LayerFS state.
import { useEffect, useRef } from 'react'
import FM from '../../../../../sdk_sim/simulation_engine/files.js'
import M from '../../../../../sdk_sim/simulation_engine/model.js'
import { createView, injectStyle } from '../../../view/src/index.js'
import { api, type ProjectState } from './api.ts'
import { AVATARS } from './avatars.ts'
import { projectModel, treeLoader, type TreeCache } from './replay.ts'
import { followTheme } from './theme.ts'

export function ProjectBoard({ name, state }: { name: string, state: ProjectState }) {
  const host = useRef<HTMLDivElement>(null)
  const board = useRef<any>(null)
  const trees = useRef<TreeCache>(new Map())

  useEffect(() => {
    injectStyle(document)
    const root = host.current!
    let soon: ReturnType<typeof setTimeout> | undefined
    board.current = createView(root, { avatars: AVATARS, files: FM, lineDiff: M.lineDiff, live: false, lead: 'main', project: true })
    board.current.rerender = () => { clearTimeout(soon); soon = setTimeout(() => board.current?.W && board.current.render(), 40) }
    const unfollow = followTheme(root)
    trees.current = new Map()
    return () => { clearTimeout(soon); unfollow(); board.current.dispose(); board.current = null }
  }, [name])

  useEffect(() => {
    const b = board.current
    if (!b) return
    const W = projectModel(state, treeLoader(name, trees.current, (real) => api.projectTree(name, real)), () => b.rerender())
    for (const agent of ['main', ...new Set(Object.values(state.authors))]) b.avatar(agent)
    b.W = W
    b.render()
  }, [name, state])

  return <div ref={host} style={{ position: 'relative', flex: 1, minHeight: 380, borderRadius: 'var(--dsw-radius-md)', overflow: 'hidden', border: '1px solid var(--dsw-alias-border-l2)' }} />
}
