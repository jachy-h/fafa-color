const PARTICLE_COUNT_MIN = 60
const PARTICLE_COUNT_MAX = 120
const GRAVITY = 0.15
const DRAG = 0.985
const LIFE_DECAY_MIN = 0.012
const LIFE_DECAY_MAX = 0.022

let canvas = null
let ctx = null
let particles = []
let raf = null
let markEl = null
let markTimer = null

function setup() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.id = 'fx'
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:150;'
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
}

function resize() {
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function spawn(b, x, y, palette) {
  const count =
    PARTICLE_COUNT_MIN + Math.floor(Math.random() * (PARTICLE_COUNT_MAX - PARTICLE_COUNT_MIN))
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 5
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color: palette[Math.floor(Math.random() * palette.length)],
      life: 1,
      decay: LIFE_DECAY_MIN + Math.random() * (LIFE_DECAY_MAX - LIFE_DECAY_MIN),
      size: 1.6 + Math.random() * 2.4,
    })
  }
  if (!raf) loop()
}

function loop() {
  raf = requestAnimationFrame(loop)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += GRAVITY
    p.vx *= DRAG
    p.vy *= DRAG
    p.life -= p.decay
    if (p.life <= 0 || p.y > window.innerHeight + 40) {
      particles.splice(i, 1)
      continue
    }
    ctx.globalAlpha = Math.max(0, p.life)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  if (particles.length === 0) {
    cancelAnimationFrame(raf)
    raf = null
  }
}

function ensureMark() {
  if (markEl) return
  markEl = document.createElement('div')
  markEl.id = 'fx-mark'
  markEl.setAttribute('aria-hidden', 'true')
  markEl.textContent = 'fafa'
  document.body.appendChild(markEl)
}

function pulseMark() {
  ensureMark()
  markEl.classList.add('on')
  clearTimeout(markTimer)
  markTimer = setTimeout(() => markEl.classList.remove('on'), 2000)
}

export function spawnFirework(b, x, y, palette) {
  setup()
  spawn(b, x, y, palette)
  pulseMark()
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
