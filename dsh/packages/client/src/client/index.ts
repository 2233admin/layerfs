// @dsh-layerfs/client: the LayerFS tab beside Chat and Trajectory, the
// project picker in the New Session row, and the LayerFS sidebar panel.
// With the dsh-layerfs-demo bundle, also the demo workspace's Sessions (one
// per demo, made when missing) and the demo strip above their composer.
import { demoApi, ensureDemoSessions, type DemoServices } from './demo.ts'
import { DemoStrip } from './DemoStrip.tsx'
import { LayerFsIcon, LayerFsPanel, type PanelServices } from './LayerFsPanel.tsx'
import { LayerFsView } from './LayerFsView.tsx'
import { ProjectPicker } from './ProjectPicker.tsx'

export const inject = ['slots']

const PANEL = 'layerfs'

// any: this bundle builds outside the dsh workspace, without its Context types
export function apply(ctx: any): void {
  const directories = () => ctx.get('uiWorkspace')
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'layerfs',
    order: 20,
    label: () => 'LayerFS',
    inject: (sessionId: string) => ({ sessionId, directories }),
  }, LayerFsView))
  // workspace services are optional: without them the panel lists no
  // workspaces and Init offers only the workspace folder as its source
  const services = (): PanelServices => ({ workspaces: ctx.get('workspaces'), uiWorkspace: ctx.get('uiWorkspace') })
  // the Remote services, while the scope that injects them is up
  let remote: DemoServices['remote']
  const demoServices = (): DemoServices => ({ remote, uiWorkspace: ctx.get('uiWorkspace'), workspaces: ctx.get('workspaces') })
  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'layerfs-demo',
    order: 5,
    inject: (sessionId: string) => ({ sessionId, services: demoServices }),
  }, DemoStrip))
  // once the Remote session services are up: every demo gets its Session
  ctx.inject(['remote', 'remote.session', 'remote.workspace'], (scope: any) => {
    remote = scope.remote
    scope.effect(() => () => { remote = undefined }, 'layerfs-client: demo Remote services')
    demoApi.info().then((info) => info && ensureDemoSessions(demoServices(), info)).catch((error) => {
      console.warn('layerfs-client: demo Sessions were not made:', error)
    })
  })
  ctx.slots.inject('conversation.hero.options', () => ctx.slots.register({
    name: 'conversation.hero.options',
    id: 'layerfs-project',
    order: 50,
    label: () => 'LayerFS project',
    inject: (sessionId: string) => ({ sessionId, directories }),
  }, ProjectPicker))
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL,
    inject: () => ({ services }),
  }, LayerFsPanel))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL,
    order: 40,
    label: () => 'LayerFS',
  }, LayerFsIcon))
}
