// The shared engine for the demo videos: virtual time, frame capture, and encoding.
//
// Chrome on macOS does not support begin-frame control, so the engine uses
// virtual time. An init script replaces the page clock (performance.now, Date,
// requestAnimationFrame, and timers). Before each frame, the engine moves the
// clock forward by exactly 1000/fps ms and seeks every CSS transition and CSS
// animation to the same time. Then it takes a screenshot. Scripted mouse input
// goes through Playwright (CDP Input.dispatchMouseEvent), so the real pointer
// handlers of the component run. See README.md in this folder.
import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"

export const easeInOutCubic = (u) =>
  u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2
export const easeOutCubic = (u) => 1 - (1 - u) ** 3
export const easeInOutSine = (u) => -(Math.cos(Math.PI * u) - 1) / 2
export const clamp01 = (u) => Math.min(1, Math.max(0, u))
export const lerp = (a, b, u) => a + (b - a) * u
export const progress = (t, start, end) => clamp01((t - start) / (end - start))

/** A point on a ring. Degrees go clockwise from 12 o'clock. */
export function polar(center, degrees, radius) {
  const radians = (degrees * Math.PI) / 180
  return {
    x: center.x + Math.sin(radians) * radius,
    y: center.y - Math.cos(radians) * radius,
  }
}

/** A straight move with a slight curve, the way a hand moves a mouse. */
export function curvedMove(from, to, u, bend) {
  const x = lerp(from.x, to.x, u)
  const y = lerp(from.y, to.y, u)
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const offset = Math.sin(Math.PI * u) * bend
  return { x: x + (-dy / length) * offset, y: y + (dx / length) * offset }
}

/** Reads `--name value` flags from the command line. */
export function cliFlags(argv = process.argv.slice(2)) {
  const value = (name, fallback) => {
    const index = argv.indexOf(name)
    return index === -1 ? fallback : argv[index + 1]
  }
  return { value, has: (name) => argv.includes(name) }
}

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
  window.setTimeout = (callback, delay, ...args) =>
    addTimer(callback, delay, args, false)
  window.setInterval = (callback, delay, ...args) =>
    addTimer(callback, delay, args, true)
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
      if (animation.playState === "idle" || animation.playState === "finished")
        tracked.delete(animation)
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
        for (const [id, timer] of timers)
          if (timer.at <= now && (!next || timer.at < next[1].at))
            next = [id, timer]
        if (!next) break
        const [id, timer] = next
        if (timer.repeat) timer.at += Math.max(1, timer.ms)
        else timers.delete(id)
        try {
          if (typeof timer.callback === "function")
            timer.callback(...timer.args)
          else eval(timer.callback)
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
 * Recording and encoding
 * -------------------------------------------------------------------------*/

/**
 * Records a scene frame by frame and encodes it.
 *
 * - `url`: the scene page. It must render an element with the class `video-cursor`.
 * - `width`, `height`, `scale`: the CSS viewport and the device scale factor.
 *   The output size is the viewport times the scale.
 * - `fps`, `duration`: the capture rate and the length in seconds.
 * - `pointer(t)`, `pressed(t)`: the choreography. `t` is in seconds.
 * - `outputs`: a list of `{ file, fps, filter }`. `filter` is optional ffmpeg filter
 *   text that runs before the color conversion.
 */
export async function recordScene({
  url,
  width,
  height,
  scale,
  fps,
  duration,
  pointer,
  pressed,
  outputs,
  outDir,
  framesDir,
  keepFrames = false,
  ffmpeg = "/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg",
}) {
  const frames =
    framesDir ?? mkdtempSync(path.join(os.tmpdir(), "pie-menu-frames-"))
  const frameMs = 1000 / fps
  const { chromium } = await import("playwright")
  const browser = await chromium.launch({
    args: ["--hide-scrollbars", "--disable-background-timer-throttling"],
  })
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    colorScheme: "light",
    reducedMotion: "no-preference",
  })
  await context.addInitScript(installVirtualTime)
  const page = await context.newPage()
  page.on("pageerror", (error) => console.error("page error:", error))
  await page.goto(url, { waitUntil: "load" })
  await page.waitForSelector(".video-cursor")
  await page.evaluate(() => document.fonts.ready)

  const advance = () =>
    page.evaluate((ms) => window.__video.advance(ms), frameMs)
  for (let i = 0; i < 12; i++) await advance()

  mkdirSync(frames, { recursive: true })
  const total = Math.round(duration * fps)
  let last = null
  let wasPressed = false

  for (let frame = 0; frame < total; frame++) {
    const t = frame / fps
    const raw = pointer(t)
    const position = {
      x: Math.round(raw.x * 100) / 100,
      y: Math.round(raw.y * 100) / 100,
    }
    const isPressed = pressed(t)

    if (!last || last.x !== position.x || last.y !== position.y)
      await page.mouse.move(position.x, position.y)
    if (isPressed && !wasPressed) await page.mouse.down({ button: "left" })
    if (!isPressed && wasPressed) await page.mouse.up({ button: "left" })
    last = position
    wasPressed = isPressed

    // The first frame shows time 0. Every later frame is exactly 1000/fps ms after the one before.
    if (frame > 0) await advance()
    else
      await page.evaluate(() =>
        window.__video.settle().then(() => window.__video.syncAnimations())
      )

    // scale "device" gives full-size frames. "allow" keeps the seeked animation state as it is.
    const png = await page.screenshot({
      type: "png",
      scale: "device",
      animations: "allow",
      caret: "hide",
    })
    writeFileSync(
      path.join(frames, `frame-${String(frame).padStart(5, "0")}.png`),
      png
    )
    if (frame % fps === 0) process.stdout.write(`frame ${frame}/${total}\n`)
  }
  await browser.close()
  console.log(`Captured ${total} frames into ${frames}`)

  mkdirSync(outDir, { recursive: true })
  const outWidth = Math.round(width * scale)
  const outHeight = Math.round(height * scale)
  const toYuv = `scale=${outWidth}:${outHeight}:flags=lanczos:out_color_matrix=bt709:out_range=tv`
  for (const output of outputs) {
    const target = path.join(outDir, output.file)
    const filter = output.filter ? `${output.filter},${toYuv}` : toYuv
    const result = spawnSync(
      ffmpeg,
      [
        "-y",
        "-loglevel",
        "error",
        "-framerate",
        String(fps),
        "-i",
        path.join(frames, "frame-%05d.png"),
        "-vf",
        filter,
        "-r",
        String(output.fps),
        ...[
          "-c:v",
          "libx264",
          "-preset",
          "slow",
          "-crf",
          "18",
          "-pix_fmt",
          "yuv420p",
        ],
        ...[
          "-color_primaries",
          "bt709",
          "-color_trc",
          "bt709",
          "-colorspace",
          "bt709",
        ],
        ...["-movflags", "+faststart", "-an"],
        target,
      ],
      { stdio: "inherit" }
    )
    if (result.status !== 0) throw new Error(`ffmpeg failed for ${target}`)
    console.log(`Wrote ${target}`)
  }

  if (!keepFrames) rmSync(frames, { recursive: true, force: true })
}
