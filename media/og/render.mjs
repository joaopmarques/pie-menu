// Renders media/og/index.html to public/og.png (1200x630).
// Start the dev server first: pnpm dev --port 5191 --strictPort
import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const url = process.env.OG_URL ?? "http://localhost:5191/media/og/index.html"
const output = path.join(root, "public/og.png")
const ffmpeg = process.env.FFMPEG ?? "/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg"

// The card is 800x420 CSS px. A 3x capture, scaled down to 1200x630, gives a crisp 1.5x image.
const CARD = { width: 800, height: 420 }
const SCALE = 3
// The item to highlight: the second of six items, at 60 degrees clockwise from 12 o'clock.
const HIGHLIGHT_ANGLE = 60

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: CARD, deviceScaleFactor: SCALE })
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForSelector('[data-slot="pie-menu-item"]')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(700)

  const center = await page.evaluate(() => {
    const menu = document.querySelector('[role="menu"]')
    const rect = menu.getBoundingClientRect()
    return { x: rect.left, y: rect.top }
  })
  const radians = (HIGHLIGHT_ANGLE * Math.PI) / 180
  const target = { x: center.x + Math.sin(radians) * 90, y: center.y - Math.cos(radians) * 90 }
  await page.mouse.move(center.x, center.y)
  await page.mouse.move(target.x, target.y, { steps: 8 })
  // Wait for the highlight, the arc, and the head turn to settle.
  await page.waitForTimeout(700)

  const scratch = mkdtempSync(path.join(tmpdir(), "pie-menu-og-"))
  const raw = path.join(scratch, "raw.png")
  await page.screenshot({ path: raw })
  execFileSync(ffmpeg, [
    "-y", "-loglevel", "error", "-i", raw,
    "-vf", "scale=1200:630:flags=lanczos",
    "-compression_level", "100", "-pred", "mixed",
    output,
  ])
  rmSync(scratch, { recursive: true, force: true })
  console.log(`Wrote ${path.relative(root, output)} (${statSync(output).size} bytes)`)
} finally {
  await browser.close()
}
