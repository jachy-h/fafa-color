import { SEGMENT_NAMES } from './name.js'

const FA = 0xfa
const hex = (v) => {
  const h = (x) => x.toString(16).padStart(2, '0').toUpperCase()
  return `#${h(FA)}${h(FA)}${h(v)}`
}

const BLURBS = [
  '一天从最轻的一声开始',
  '正午的光，都落在麦浪上',
  '咸的风，从海面吹到纸上',
  '风一吹，就有清脆的响',
  '水面的光，慢慢往天上去',
  '夜的颜色，是软的',
  '露水把星光捧了一夜',
  '最冷的地方，有最亮的光',
]

export const CHAPTERS = SEGMENT_NAMES.map((words, i) => {
  const from = i * 32
  const to = i * 32 + 31
  return {
    room: i + 1,
    words,
    blurb: BLURBS[i],
    from,
    to,
    hexFrom: hex(from),
    hexTo: hex(to),
  }
})

export const MANIFESTO =
  '这里没有别的颜色。只有 256 个名字，和它们各自的 fafa。\n每一种颜色，都是一个人的名字；每一个名字，都代表一片颜色。\n没有广告，没有推荐，没有算法——每一格，都是手写的名字。'

export const VISIT_GUIDE = [
  '点击任意颜色，进入它的展厅',
  '长按复制颜色名字',
  '滚轮 / 左右滑动切换视图',
  '三击同一颜色，燃放烟火',
  '双指轻点，快速切换视图',
]
