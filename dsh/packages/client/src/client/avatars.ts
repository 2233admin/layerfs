// The cast the view draws (sharky_maid, built by sdk_sim/avatars/build.py),
// with each sheet bundled as a data URL instead of a page-relative path.
import '../../../../../sdk_sim/avatars/avatars.js'
import heads from '../../../../../sdk_sim/avatars/heads.png'
import ellen from '../../../../../sdk_sim/avatars/ellen_joe.png'
import v2 from '../../../../../sdk_sim/avatars/2.png'
import v3 from '../../../../../sdk_sim/avatars/3.png'
import v4 from '../../../../../sdk_sim/avatars/4.png'
import v5 from '../../../../../sdk_sim/avatars/5.png'
import v6 from '../../../../../sdk_sim/avatars/6.png'
import v7 from '../../../../../sdk_sim/avatars/7.png'
import v8 from '../../../../../sdk_sim/avatars/8.png'
import v9 from '../../../../../sdk_sim/avatars/9.png'
import v11 from '../../../../../sdk_sim/avatars/11.png'
import v12 from '../../../../../sdk_sim/avatars/12.png'
import v13 from '../../../../../sdk_sim/avatars/13.png'

const SHEETS: Record<string, string> = {
  'avatars/heads.png': heads,
  'avatars/ellen_joe.png': ellen,
  'avatars/2.png': v2,
  'avatars/3.png': v3,
  'avatars/4.png': v4,
  'avatars/5.png': v5,
  'avatars/6.png': v6,
  'avatars/7.png': v7,
  'avatars/8.png': v8,
  'avatars/9.png': v9,
  'avatars/11.png': v11,
  'avatars/12.png': v12,
  'avatars/13.png': v13,
}

const source = (globalThis as any).DSH_AVATARS
delete (globalThis as any).DSH_AVATARS

const sheet = (path: string) => {
  if (!SHEETS[path]) throw new Error(`avatar sheet ${path} is not bundled`)
  return SHEETS[path]
}

export const AVATARS = {
  ...source,
  heads: sheet(source.heads),
  chars: Object.fromEntries(Object.entries(source.chars).map(([id, c]: [string, any]) => [id, { ...c, sheet: sheet(c.sheet) }])),
}
