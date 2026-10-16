// @dsh-layerfs/client: the LayerFS tab beside Chat and Trajectory, the
// project picker in the New Session row, and the LayerFS sidebar panel.
import { LayerFsIcon, LayerFsPanel, type PanelServices } from './LayerFsPanel.tsx'
import { LayerFsView } from './LayerFsView.tsx'
import { ProjectPicker } from './ProjectPicker.tsx'

export const inject = ['slots']

const PANEL = 'layerfs'

// any: this bundle builds outside the dsh workspace, without its Context types
export function apply(ctx: any): void {
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'layerfs',
    order: 20,
    label: () => 'LayerFS',
    inject: (sessionId: string) => ({ sessionId }),
  }, LayerFsView))
  ctx.slots.inject('conversation.hero.options', () => ctx.slots.register({
    name: 'conversation.hero.options',
    id: 'layerfs-project',
    order: 50,
    label: () => 'LayerFS project',
    inject: (sessionId: string) => ({ sessionId }),
  }, ProjectPicker))
  // workspace services are optional: the panel lists none without them
  const services = (): PanelServices => ({ workspaces: ctx.get('workspaces'), uiWorkspace: ctx.get('uiWorkspace') })
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
