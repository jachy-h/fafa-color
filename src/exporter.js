const FA = 0xfa
const SIZE = 1080
const GRID = 16
const CELL = SIZE / GRID

export function exportPalette() {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  for (let b = 0; b < 256; b++) {
    const row = Math.floor(b / GRID)
    const col = b % GRID
    ctx.fillStyle = `rgb(${FA}, ${FA}, ${b})`
    ctx.fillRect(col * CELL, row * CELL, CELL, CELL)
  }
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

export function makeFilename(ts = Date.now()) {
  const d = new Date(ts)
  const pad = (n) => n.toString().padStart(2, '0')
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  return `fafa-palette-${stamp}.png`
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
