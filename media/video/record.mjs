#!/usr/bin/env node
// Records the pie menu demo video frame by frame at 120 fps.
//
// Chrome on macOS does not support begin-frame control, so this script uses
// virtual time. An init script replaces the page clock (performance.now, Date,
// requestAnimationFrame, and timers). Before each frame, the script moves the
// clock forward by exactly 1000/120 ms and seeks every CSS transition and CSS
// animation to the same time. Then it takes a screenshot. Scripted mouse input
// goes through Playwright (CDP Input.dispatchMouseEvent), so the real pointer
// handlers of the component run. See README.md in this folder.
//
// Usage: node media/video/record.mjs [--url URL] [--frames DIR] [--out DIR] [--keep-frames]

import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "../..")

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const index = args.indexOf(name)
  return index === -1 ? fallback : args[index + 1]
}

const URL_TO_RECORD = flag("--url", "http://localhost:5190/media/video/index.html")
const FRAMES_DIR = flag("--frames") ?? mkdtempSync(path.join(os.tmpdir(), "pie-menu-frames-"))
const OUT_DIR = flag("--out", path.join(root, "public/media"))
const KEEP_FRAMES = args.includes("--keep-frames")
const FFMPEG = flag("--ffmpeg", "/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg")

const FPS = 120
const FRAME_MS = 1000 / FPS
const DURATION = 8 // seconds
// 720 x 405 CSS px at a scale of 8/3 gives 1920 x 1080 device px.
const WIDTH = 720
const HEIGHT = 405
const SCALE = 8 / 3

/* ---------------------------------------------------------------------------
 * Choreography. Times are in seconds. Positions are in CSS px.
 * -------------------------------------------------------------------------*/

const CENTER = { x: WIDTH / 2, y: Math.round(HEIGHT / 2) - 8 }
const REST = { x: CENTER.x + 175, y: CENTER.y + 118 }

const easeInOutCubic = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)
const easeOutCubic = (u) => 1 - (1 - u) ** 3
const easeInOutSine = (u) => -(Math.cos(Math.PI * u) - 1) / 2
const clamp01 = (u) => Math.min(1, Math.max(0, u))
const lerp = (a, b, u) => a + (b - a) * u
const progress = (t, start, end) => clamp01((t - start) / (end - start))

/** A point on the ring around the press point. Degrees go clockwise from 12 o'clock. */
function polar(degrees, radius) {
  const radians = (degrees * Math.PI) / 180
  return { x: CENTER.x + Math.sin(radians) * radius, y: CENTER.y - Math.cos(radians) * radius }
}

/** A straight move with a slight curve, the way a hand moves a mouse. */
function curvedMove(from, to, u, bend) {
  const x = lerp(from.x, to.x, u)
  const y = lerp(from.y, to.y, u)
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const offset = Math.sin(Math.PI * u) * bend
  return { x: x + (-dy / length) * offset, y: y + (dx / length) * offset }
}

// Items sit clockwise from the top: Copy 0, Cut 60, Paste 120, Duplicate 180, Share 240, Delete 300.
const RING = 80
const T = {
  enter: [0.35, 1.25],
  press: 1.45,
  toCut: [1.7, 2.2],
  sweep: [2.45, 4.45], // Cut -> Paste -> Duplicate -> Share -> Delete
  toCopy: [5.05, 5.55], // Delete -> Copy
  release: 5.85,
  leave: [6.4, 7.45],
}

function pointer(t) {
  if (t < T.enter[1]) {
    return curvedMove(REST, CENTER, easeInOutCubic(progress(t, ...T.enter)), -22)
  }
  if (t < T.toCut[0]) return { ...CENTER }
  if (t < T.sweep[0]) {
    const u = easeOutCubic(progress(t, ...T.toCut))
    return curvedMove(CENTER, polar(60, RING), u, 6)
  }
  if (t < T.toCopy[0]) {
    const u = easeInOutSine(progress(t, ...T.sweep))
    const angle = lerp(60, 300, u)
    // A hand does not hold an exact radius.
    return polar(angle, RING + Math.sin(u * Math.PI * 3) * 5)
  }
  if (t < T.release) {
    const u = easeInOutCubic(progress(t, ...T.toCopy))
    return polar(lerp(300, 360, u), RING - Math.sin(u * Math.PI) * 4)
  }
  const copy = polar(360, RING)
  return curvedMove(copy, REST, easeInOutCubic(progress(t, ...T.leave)), 26)
}

const pressed = (t) => t >= T.press && t < T.release

/* ---------------------------------------------------------------------------
 * Virtual time. This function runs in the page before any page script.
 * -------------------------------------------------------------------------*/

function installVirtualTime() {
  const realRaf = window.requestAnimationFrame.bind(window)
  const realSetTimeout = window.setTimeout.bind(window)
  const RealDate = Date
  const epoch = RealDate.now()
  let now = 0

  // requestAnimationFrame: callbacks run only when the recorder moves the clock.
  let rafId = 0
  let rafQueue = new Map()
  window.requestAnimationFrame = (callback) => {
    rafQueue.set(++rafId, callback)
    return rafId
  }
  window.cancelAnimationFrame = (id) => rafQueue.delete(id)

  // Timers run on the virtual clock.
  let timerId = 0
  const timers = new Map()
  const addTimer = (callback, delay, args, repeat) => {
    const id = ++timerId
    const ms = Math.max(0, Number(delay) || 0)
    timers.set(id, { at: now + ms, ms, callback, args, repeat })
    return id
  }
  window.setTimeout = (callback, delay, ...args) => addTimer(callback, delay, args, false)
  window.setInterval = (callback, delay, ...args) => addTimer(callback, delay, args, true)
  window.clearTimeout = window.clearInterval = (id) => timers.delete(id)

  performance.now = () => now
  class VirtualDate extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [epoch + now]))
    }
    static now() {
      return epoch + now
    }
  }
  window.Date = VirtualDate

  // CSS transitions and animations: pause each one and seek it to virtual time.
  const tracked = new Map()
  // A finished animation with fill "forwards" or "both" stays in getAnimations(). Do not start it again.
  const done = new WeakSet()
  const syncAnimations = () => {
    for (const animation of document.getAnimations()) {
      if (animation.playState === "idle" || done.has(animation)) continue
      let entry = tracked.get(animation)
      if (!entry) {
        entry = { start: now }
        tracked.set(animation, entry)
        animation.pause()
      }
      const end = animation.effect.getComputedTiming().endTime
      const time = now - entry.start
      if (time >= end && Number.isFinite(end)) {
        animation.finish()
        tracked.delete(animation)
        done.add(animation)
      } else {
        animation.currentTime = time
      }
    }
    for (const animation of tracked.keys()) {
      if (animation.playState === "idle" || animation.playState === "finished") tracked.delete(animation)
    }
  }

  const realFrame = () => new Promise((resolve) => realRaf(() => resolve()))
  const settle = async () => {
    // Let React flush its scheduled work and let Chrome dispatch queued input.
    await realFrame()
    await new Promise((resolve) => realSetTimeout(resolve, 0))
    await realFrame()
  }

  window.__video = {
    now: () => now,
    async advance(ms) {
      now += ms
      // Timers that are due, in order.
      for (;;) {
        let next
        for (const [id, timer] of timers) if (timer.at <= now && (!next || timer.at < next[1].at)) next = [id, timer]
        if (!next) break
        const [id, timer] = next
        if (timer.repeat) timer.at += Math.max(1, timer.ms)
        else timers.delete(id)
        try {
          typeof timer.callback === "function" ? timer.callback(...timer.args) : eval(timer.callback)
        } catch (error) {
          console.error(error)
        }
      }
      const queue = rafQueue
      rafQueue = new Map()
      for (const callback of queue.values()) {
        try {
          callback(now)
        } catch (error) {
          console.error(error)
        }
      }
      await settle()
      syncAnimations()
      // Promise callbacks from finished animations can change state. Let them run, then seek again.
      await settle()
      syncAnimations()
    },
    syncAnimations,
    settle,
  }
}

/* ---------------------------------------------------------------------------
 * Recording
 * -------------------------------------------------------------------------*/

async function record() {
  const { chromium } = await import("playwright")
  const browser = await chromium.launch({ args: ["--hide-scrollbars", "--disable-background-timer-throttling"] })
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
    colorScheme: "light",
    reducedMotion: "no-preference",
  })
  await context.addInitScript(installVirtualTime)
  const page = await context.newPage()
  page.on("pageerror", (error) => console.error("page error:", error))
  await page.goto(URL_TO_RECORD, { waitUntil: "load" })
  await page.waitForSelector(".video-cursor")
  await page.evaluate(() => document.fonts.ready)

  const advance = () => page.evaluate((ms) => window.__video.advance(ms), FRAME_MS)
  for (let i = 0; i < 12; i++) await advance()

  mkdirSync(FRAMES_DIR, { recursive: true })
  const total = Math.round(DURATION * FPS)
  let last = null
  let wasPressed = false

  for (let frame = 0; frame < total; frame++) {
    const t = frame / FPS
    const raw = pointer(t)
    const position = { x: Math.round(raw.x * 100) / 100, y: Math.round(raw.y * 100) / 100 }
    const isPressed = pressed(t)

    if (!last || last.x !== position.x || last.y !== position.y) await page.mouse.move(position.x, position.y)
    if (isPressed && !wasPressed) await page.mouse.down({ button: "left" })
    if (!isPressed && wasPressed) await page.mouse.up({ button: "left" })
    last = position
    wasPressed = isPressed

    // The first frame shows time 0. Every later frame is exactly 1000/120 ms after the one before.
    if (frame > 0) await advance()
    else await page.evaluate(() => window.__video.settle().then(() => window.__video.syncAnimations()))

    // scale "device" gives 1920 x 1080 px. "allow" keeps the seeked animation state as it is.
    const png = await page.screenshot({ type: "png", scale: "device", animations: "allow", caret: "hide" })
    writeFileSync(path.join(FRAMES_DIR, `frame-${String(frame).padStart(5, "0")}.png`), png)
    if (frame % 120 === 0) process.stdout.write(`frame ${frame}/${total}\n`)
  }

  await browser.close()
  console.log(`Captured ${total} frames into ${FRAMES_DIR}`)
  return total
}

function encode() {
  mkdirSync(OUT_DIR, { recursive: true })
  const input = ["-framerate", String(FPS), "-i", path.join(FRAMES_DIR, "frame-%05d.png")]
  const toYuv = "scale=1920:1080:flags=lanczos:out_color_matrix=bt709:out_range=tv"
  const output = [
    ...["-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p"],
    ...["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"],
    ...["-movflags", "+faststart", "-an"],
  ]
  const run = (filter, fps, file) => {
    const target = path.join(OUT_DIR, file)
    const ffmpegArgs = ["-y", "-loglevel", "error", ...input, "-vf", filter, "-r", String(fps), ...output, target]
    const result = spawnSync(FFMPEG, ffmpegArgs, { stdio: "inherit" })
    if (result.status !== 0) throw new Error(`ffmpeg failed for ${target}`)
    console.log(`Wrote ${target}`)
  }
  run(toYuv, FPS, "pie-menu-demo-120fps.mp4")
  // 60 fps: keep every second frame of the 120 fps capture. No frame blending.
  run(`select=not(mod(n\\,2)),setpts=N/60/TB,${toYuv}`, 60, "pie-menu-demo-60fps.mp4")
}

await record()
encode()
if (!KEEP_FRAMES) rmSync(FRAMES_DIR, { recursive: true, force: true })
