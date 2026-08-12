const FA = 0xfa
const SEG_WIDTH = 32
const SEG_COUNT = 8

const SEGMENTS = [
  ['黎明', '柠檬', '初醒'],
  ['午后', '麦浪', '微光'],
  ['海盐', '薄雾', '清浅'],
  ['风铃', '春茶', '静谧'],
  ['湖畔', '云朵', '悠远'],
  ['月光', '棉絮', '轻盈'],
  ['星夜', '凝露', '温柔'],
  ['雪原', '极光', '纯粹'],
]

const hex = (b) => {
  const h = (v) => v.toString(16).padStart(2, '0').toUpperCase()
  return `#${h(FA)}${h(FA)}${h(b)}`
}

const rgb = (b) => `rgb(${FA}, ${FA}, ${b})`

export function segmentOf(b) {
  if (b < 0) return 0
  if (b >= 256) return SEG_COUNT - 1
  return Math.floor(b / SEG_WIDTH)
}

export function nameOf(b) {
  const seg = segmentOf(b)
  const inner = Math.max(0, Math.min(255, b)) % SEG_WIDTH
  const wordIdx = Math.floor((inner * SEGMENTS[seg].length) / SEG_WIDTH)
  const word = SEGMENTS[seg][wordIdx]
  return `fafa的${word}·${hex(b).toLowerCase()}`
}

export function themeWordOf(b) {
  const seg = segmentOf(b)
  const inner = Math.max(0, Math.min(255, b)) % SEG_WIDTH
  const wordIdx = Math.floor((inner * SEGMENTS[seg].length) / SEG_WIDTH)
  return SEGMENTS[seg][wordIdx]
}

export function segmentWords(seg) {
  return SEGMENTS[seg] || []
}

export function segmentPalette(seg) {
  const palette = []
  for (let i = 0; i < 5; i++) {
    const b = seg * SEG_WIDTH + Math.floor((i * (SEG_WIDTH - 1)) / 4)
    palette.push(rgb(b))
  }
  return palette
}

export const SEGMENT_NAMES = SEGMENTS
