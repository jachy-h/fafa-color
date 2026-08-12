/**
 * favs.js — 收藏系统
 *
 * localStorage key: 'fafa:favs'（b 值数组，最多 32 个）
 * localStorage key: 'fafa:last'（最后停留的 b 值，单个数字字符串）
 */

const FAVS_KEY = 'fafa:favs'
const LAST_KEY = 'fafa:last'
const FAVS_MAX = 32

function read() {
  try {
    const raw = localStorage.getItem(FAVS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((v) => Number.isInteger(v) && v >= 0 && v <= 255) : []
  } catch {
    return []
  }
}

function write(arr) {
  try {
    localStorage.setItem(FAVS_KEY, JSON.stringify(arr))
  } catch {
    /* 静默 */
  }
}

export function getFavs() {
  return read()
}

export function isFav(b) {
  return read().includes(b)
}

export function addFav(b) {
  const arr = read()
  if (arr.includes(b)) return { ok: true, full: false }
  if (arr.length >= FAVS_MAX) return { ok: false, full: true }
  arr.push(b)
  write(arr)
  return { ok: true, full: false }
}

export function removeFav(b) {
  const arr = read().filter((v) => v !== b)
  write(arr)
}

export function toggleFav(b) {
  if (isFav(b)) {
    removeFav(b)
    return false // 现在未收藏
  } else {
    const res = addFav(b)
    return res.ok ? true : 'full'
  }
}

export function favsCount() {
  return read().length
}

/* ---- 上次停留 ---- */

export function setLast(b) {
  try {
    localStorage.setItem(LAST_KEY, String(b))
  } catch {
    /* 静默 */
  }
}

export function getLast() {
  try {
    const v = localStorage.getItem(LAST_KEY)
    if (v === null) return null
    const n = Number(v)
    return Number.isInteger(n) && n >= 0 && n <= 255 ? n : null
  } catch {
    return null
  }
}
