// The cast dsh draws its agents with: the sharky maids (view/src/skins/maids;
// fan art, a local skin, never a published one), for every agent on the
// LayerFS tab and the project board. The website's heroes (skins/heroes) are
// not offered here, so there is no Cast switch. Each image is bundled as a
// data URL instead of a page-relative path.
import { maidAvatars } from '../../../view/src/skins/maids/cast.js'
import m11 from '../../../../../sdk_sim/avatars/11.png'
import m12 from '../../../../../sdk_sim/avatars/12.png'
import m13 from '../../../../../sdk_sim/avatars/13.png'
import m2 from '../../../../../sdk_sim/avatars/2.png'
import m3 from '../../../../../sdk_sim/avatars/3.png'
import m4 from '../../../../../sdk_sim/avatars/4.png'
import m5 from '../../../../../sdk_sim/avatars/5.png'
import m6 from '../../../../../sdk_sim/avatars/6.png'
import m7 from '../../../../../sdk_sim/avatars/7.png'
import m8 from '../../../../../sdk_sim/avatars/8.png'
import m9 from '../../../../../sdk_sim/avatars/9.png'
import ellen from '../../../../../sdk_sim/avatars/ellen_joe.png'
import heads from '../../../../../sdk_sim/avatars/heads.png'

const SHEET: Record<string, string> = { ellen_joe: ellen, 2: m2, 3: m3, 4: m4, 5: m5, 6: m6, 7: m7, 8: m8, 9: m9, 11: m11, 12: m12, 13: m13, heads }

export const MAID_AVATARS = maidAvatars((name: string) => SHEET[name])

/** The view's casts: the maids alone, so their skin is on and the Cast switch is hidden. */
export const CASTS = [{ id: 'maids', label: 'Sharky maids', avatars: MAID_AVATARS }]
