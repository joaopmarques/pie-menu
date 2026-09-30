#!/usr/bin/env node
// Records the life-sim demo: the character's pie menu on the fridge.
// The output is 4:5 portrait (1080 x 1350) at 60 fps, for the LinkedIn and
// Bluesky feeds. See README.md in this folder.
//
// Usage: node media/video/record-life-sim.mjs [--url URL] [--frames DIR] [--out DIR] [--keep-frames]
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  cliFlags,
  curvedMove,
  easeInOutCubic,
  easeInOutSine,
  easeOutCubic,
  lerp,
  polar,
  progress,
  recordScene,
} from "./recorder.mjs"

const here = path.dirname(fileURLToPath(import.meta.url))
const flags = cliFlags()

const FPS = 60
const DURATION = 8.5 // seconds
// 540 x 675 CSS px at a scale of 2 gives 1080 x 1350 device px. At this width
// the pie fits with no viewport shift, so the head stays centered.
const WIDTH = 540
const HEIGHT = 675
const SCALE = 2

/* ---------------------------------------------------------------------------
 * Choreography. Times are in seconds. Positions are in CSS px.
 * -------------------------------------------------------------------------*/

// The center of the fridge tile, where the press opens the menu.
const CENTER = { x: 270, y: 384.8 }
const REST = { x: CENTER.x + 150, y: CENTER.y + 190 }
const RING = 100
const ring = (degrees, radius = RING) => polar(CENTER, degrees, radius)

// Items sit clockwise from the top: Have Snack 0, Cook Dinner 90, Grab a Soda 180, Clean 270.
const T = {
  enter: [0.3, 1.2],
  press: 1.4,
  toCook: [1.65, 2.15],
  toSoda: [2.55, 3.35],
  toClean: [3.75, 4.55],
  toSnack: [4.95, 5.65],
  release: 6.0,
  leave: [6.6, 7.7],
}

/** A sweep around the ring. A hand does not hold an exact radius. */
const sweep = (t, [start, end], from, to) => {
  const u = easeInOutSine(progress(t, start, end))
  return ring(lerp(from, to, u), RING + Math.sin(u * Math.PI) * 6)
}

function pointer(t) {
  if (t < T.enter[1])
    return curvedMove(
      REST,
      CENTER,
      easeInOutCubic(progress(t, ...T.enter)),
      -24
    )
  if (t < T.toCook[0]) return { ...CENTER }
  if (t < T.toSoda[0])
    return curvedMove(
      CENTER,
      ring(90),
      easeOutCubic(progress(t, ...T.toCook)),
      8
    )
  if (t < T.toClean[0]) return sweep(t, T.toSoda, 90, 180)
  if (t < T.toSnack[0]) return sweep(t, T.toClean, 180, 270)
  if (t < T.release) return sweep(t, T.toSnack, 270, 360)
  return curvedMove(ring(0), REST, easeInOutCubic(progress(t, ...T.leave)), 30)
}

const pressed = (t) => t >= T.press && t < T.release

await recordScene({
  url: flags.value("--url", "http://localhost:5190/media/video/life-sim.html"),
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
  outputs: [{ file: "pie-menu-life-sim-1080x1350.mp4", fps: 60 }],
})
