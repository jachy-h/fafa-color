import './style.css'
import { nameOf, themeWordOf, segmentOf, segmentPalette } from './name.js'
import { prefersReducedMotion } from './fx.js'

const FA = 0xfa
const N = 256

const hex = (b) => {
  const h = (v) => v.toString(16).padStart(2, '0').toUpperCase()
  return `#${h(FA)}${h(FA)}${h(b)}`
}

const rgb = (b) => `rgb(${FA}, ${FA}, ${b})`

/* ---- 时间感 ---- */
function nowB() {
  const now = new Date()
  const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  return Math.floor((secs / 86400) * 256) % 256
}
function nowTimeStr() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

/* ---- DOM ---- */
const app = document.querySelector('#app')
app.innerHTML = `
  <section id="splash">
    <div class="glyph" aria-hidden="true"></div>
    <div class="blob" aria-hidden="true"></div>
    <div id="splash-tagline" aria-hidden="true">一个人的名字，一片颜色</div>
  </section>

  <main id="stage" hidden>
    <!-- 左：当前色 -->
    <div id="panel-cur">
      <div id="cur-glow" aria-hidden="true"></div>
      <div id="cur-mark" aria-hidden="true"></div>
    </div>

    <!-- 右：下一色预览 -->
    <div id="panel-next">
      <div id="next-mark" aria-hidden="true"></div>
    </div>

    <!-- 中线 + 文字区 -->
    <div id="divider" aria-hidden="true"></div>
    <div id="center-info">
      <div id="cur-name"></div>
      <div id="cur-hex"></div>
    </div>

    <!-- 底部色带轨迹 -->
    <div id="trail-bar" aria-hidden="true">
      <div id="trail-track"></div>
    </div>

    <!-- 右下：下一色名预览 -->
    <div id="next-preview" aria-hidden="true">
      <span id="next-name"></span>
    </div>

    <!-- 时间标签 -->
    <div id="now-label" aria-hidden="true">
      <span id="now-dot"></span>
      <span id="now-time"></span>
      <span id="now-name"></span>
    </div>

    <!-- 提示 -->
    <div id="story-hint" aria-hidden="true">向上滚动 · 推进故事</div>
  </main>

  <div id="flash" aria-hidden="true"></div>
`

const splash = document.querySelector('#splash')
const stage = document.querySelector('#stage')
const panelCur = document.querySelector('#panel-cur')
const panelNext = document.querySelector('#panel-next')
const curGlow = document.querySelector('#cur-glow')
const curMark = document.querySelector('#cur-mark')
const nextMark = document.querySelector('#next-mark')
const divider = document.querySelector('#divider')
const centerInfo = document.querySelector('#center-info')
const curName = document.querySelector('#cur-name')
const curHex = document.querySelector('#cur-hex')
const trailTrack = document.querySelector('#trail-track')
const nextPreview = document.querySelector('#next-preview')
const nextNameEl = document.querySelector('#next-name')
const nowLabel = document.querySelector('#now-label')
const nowDot = document.querySelector('#now-dot')
const nowTime = document.querySelector('#now-time')
const nowNameEl = document.querySelector('#now-name')
const storyHint = document.querySelector('#story-hint')
const flash = document.querySelector('#flash')

/* ---- 故事状态 ---- */
let currentB = 0
let isTransitioning = false

/* 色带轨迹：最多显示 24 格，记录已走过的 b 值 */
const TRAIL_MAX = 24
const trailHistory = []
const trailCells = []

function buildTrailCells() {
  trailTrack.innerHTML = ''
  trailCells.length = 0
  for (let i = 0; i < TRAIL_MAX; i++) {
    const cell = document.createElement('span')
    cell.className = 'trail-cell'
    trailTrack.appendChild(cell)
    trailCells.push(cell)
  }
}
buildTrailCells()

function updateTrail() {
  // trailHistory 最新的在末尾，显示时最新在右侧（靠近当前色）
  const len = trailHistory.length
  for (let i = 0; i < TRAIL_MAX; i++) {
    const cell = trailCells[i]
    const histIdx = len - TRAIL_MAX + i
    if (histIdx >= 0 && histIdx < len) {
      cell.style.background = rgb(trailHistory[histIdx])
      cell.style.opacity = '1'
    } else {
      cell.style.background = 'transparent'
      cell.style.opacity = '0'
    }
  }
}

function withAlpha(rgbStr, a) {
  return rgbStr.replace('rgb(', 'rgba(').replace(')', `, ${a})`)
}

/* ---- 渲染两侧面板 ---- */
function renderPanels(b, animate) {
  const nextB = (b + 1) % N

  // 当前色
  panelCur.style.background = rgb(b)

  // 氛围光取当前色段
  const pal = segmentPalette(segmentOf(b))
  curGlow.style.background =
    `radial-gradient(circle at 40% 50%, ${withAlpha(pal[0], 0.5)} 0%, ${withAlpha(pal[2], 0.2)} 45%, transparent 70%)`
  curMark.textContent = themeWordOf(b)

  // 下一色
  panelNext.style.background = rgb(nextB)
  nextMark.textContent = themeWordOf(nextB)

  // 文字区
  const animated = animate && !prefersReducedMotion()
  if (animated) {
    curName.classList.remove('in')
    curHex.classList.remove('in')
    void curName.offsetWidth
    requestAnimationFrame(() => {
      curName.classList.add('in')
      curHex.classList.add('in')
    })
  } else {
    curName.classList.add('in')
    curHex.classList.add('in')
  }
  curName.textContent = nameOf(b)
  curHex.textContent = hex(b)

  // 右下预览
  nextNameEl.textContent = nameOf(nextB)

  // 分割线颜色：介于两色之间
  const midB = Math.round((b + nextB) / 2)
  divider.style.background = rgb(midB)
}

/* ---- 推进 ---- */
function advance() {
  if (isTransitioning) return
  isTransitioning = true

  // 记录进历史
  trailHistory.push(currentB)
  if (trailHistory.length > TRAIL_MAX * 2) trailHistory.splice(0, TRAIL_MAX)

  currentB = (currentB + 1) % N

  // 入场动效：右侧展开到全屏，然后还原为分屏
  if (!prefersReducedMotion()) {
    // 右侧面板短暂扩张
    panelNext.classList.add('expanding')
    panelCur.classList.add('shrinking')
    setTimeout(() => {
      panelNext.classList.remove('expanding')
      panelCur.classList.remove('shrinking')
      renderPanels(currentB, true)
      updateTrail()
    }, 320)
  } else {
    renderPanels(currentB, false)
    updateTrail()
  }

  // 隐藏提示
  storyHint.classList.remove('visible')

  setTimeout(() => { isTransitioning = false }, prefersReducedMotion() ? 50 : 600)
}

/* ---- 时间标签 ---- */
function updateNowLabel() {
  const b = nowB()
  nowDot.style.background = rgb(b)
  nowDot.style.boxShadow = `0 0 5px 1px ${withAlpha(rgb(b), 0.6)}`
  nowTime.textContent = nowTimeStr()
  nowNameEl.textContent = nameOf(b)
}

/* ---- 开屏 ---- */
function fadeSplash() {
  splash.classList.add('fade-out')
  setTimeout(() => { splash.hidden = true }, 650)
}

function enter() {
  if (!stage.hidden) return
  fadeSplash()
  stage.hidden = false
  currentB = 0
  renderPanels(0, false)
  updateTrail()
  requestAnimationFrame(() => stage.classList.add('in'))
  storyHint.classList.add('visible')
  updateNowLabel()
  const msToNextMin = (60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds()
  setTimeout(() => {
    updateNowLabel()
    setInterval(updateNowLabel, 60000)
  }, msToNextMin)
}

let splashHandled = false
function handleSplash() {
  if (splashHandled) return
  splashHandled = true
  enter()
}
splash.addEventListener('pointerdown', handleSplash)
splash.addEventListener('click', handleSplash)

/* ---- 手势 ---- */
let lastWheel = 0
stage.addEventListener('wheel', (e) => {
  if (e.deltaY >= 0) return
  const now = performance.now()
  if (now - lastWheel < 500) return
  lastWheel = now
  advance()
}, { passive: true })

let touchStartY = 0, touchStartT = 0
stage.addEventListener('touchstart', (e) => {
  touchStartY = e.changedTouches[0].clientY
  touchStartT = performance.now()
}, { passive: true })
stage.addEventListener('touchend', (e) => {
  const dy = e.changedTouches[0].clientY - touchStartY
  if (dy < -40 && performance.now() - touchStartT < 600) advance()
}, { passive: true })

window.addEventListener('keydown', (e) => {
  if (stage.hidden) return
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault()
    advance()
  }
})

// 点击右侧预览面板推进
panelNext.addEventListener('click', (e) => {
  e.stopPropagation()
  advance()
})

// 点击当前色面板也推进（移动端友好）
panelCur.addEventListener('click', (e) => {
  e.stopPropagation()
  advance()
})
