/**
 * today.js — 今日之色算法
 *
 * 每天返回一个确定的 b 值（0-255），所有访客同天同色。
 * 算法：dayOfYear（0-364）与 year 的组合，确保同年不重复（256 色会轮回，诗意本身）。
 */

export function todayB() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay) - 1 // 0-based
  const yearSeed = now.getFullYear() % 256
  return (dayOfYear + yearSeed) % 256
}

/**
 * 格式化「今日」文案，如：今天是 fafa的柠檬 · #fafa05
 */
export function todayLabel(nameOf, hexOf) {
  const b = todayB()
  return { b, name: nameOf(b), hex: hexOf(b) }
}
