#!/usr/bin/env node
// Records the clipboard pie menu demo (16:9, 1920 x 1080) at 120 fps, plus a 60 fps copy.
// See README.md in this folder.
//
// Usage: node media/video/record.mjs [--url URL] [--frames DIR] [--out DIR] [--keep-frames]
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  cliFlags,
  curvedMove,
  easeInOutCubic,
  easeInOutSine,
  easeOutCubic,
  lerp,
  progress,
  recordScene,
  polar as ringPoint,
} from "./recorder.mjs"

const here = path.dirname(fileURLToPath(import.meta.url))
const flags = cliFlags()

const FPS = 120
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

const polar = (degrees, radius) => ringPoint(CENTER, degrees, radius)

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
    return curvedMove(
      REST,
      CENTER,
      easeInOutCubic(progress(t, ...T.enter)),
      -22
    )
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

await recordScene({
  url: flags.value("--url", "http://localhost:5190/media/video/index.html"),
  width: WIDTH,
  height: HEIGHT,
  scale: SCALE,
  fps: FPS,
  duration: DURATION,
  pointer,
  pressed,
  outDir: flags.value("--out", path.resolve(here, "../../public/media")),
  framesDir: flags.value("--frames"),
  keepFrames: flags.has("--keep-frames"),
  ffmpeg: flags.value("--ffmpeg"),
  outputs: [
    { file: "pie-menu-demo-120fps.mp4", fps: 120 },
    // 60 fps: keep every second frame of the 120 fps capture. No frame blending.
    {
      file: "pie-menu-demo-60fps.mp4",
      fps: 60,
      filter: "select=not(mod(n\\,2)),setpts=N/60/TB",
    },
  ],
})
