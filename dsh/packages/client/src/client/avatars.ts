// The cast the view draws: the LayerFS website's 14 heroes (view/heroes),
// each bundled as a data URL instead of a page-relative path.
import { heroAvatars } from '../../../view/src/heroes.js'
import axolotl from '../../../view/heroes/axolotl.png'
import bat from '../../../view/heroes/bat.png'
import bot from '../../../view/heroes/bot.png'
import cactus from '../../../view/heroes/cactus.png'
import cloud from '../../../view/heroes/cloud.png'
import crab from '../../../view/heroes/crab.png'
import flame from '../../../view/heroes/flame.png'
import frog from '../../../view/heroes/frog.png'
import ghost from '../../../view/heroes/ghost.png'
import jelly from '../../../view/heroes/jelly.png'
import penguin from '../../../view/heroes/penguin.png'
import shroom from '../../../view/heroes/shroom.png'
import snail from '../../../view/heroes/snail.png'
import sprout from '../../../view/heroes/sprout.png'

const SRC: Record<string, string> = { axolotl, bat, bot, cactus, cloud, crab, flame, frog, ghost, jelly, penguin, shroom, snail, sprout }

export const AVATARS = heroAvatars((name: string) => SRC[name])
