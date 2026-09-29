import {
  angularDistance,
  clampCenter,
  degToRad,
  fitScale,
  layoutItems,
  menuExtents,
  nearestIndex,
  shortestRotation,
  stepIndex,
  vectorAngle,
  wedgeIndex,
} from "./geometry"

const deg = (radians: number) => Math.round((radians * 180) / Math.PI)

describe("vectorAngle", () => {
  it("measures clockwise from 12 o'clock in screen space", () => {
    expect(deg(vectorAngle(0, -1))).toBe(0)
    expect(deg(vectorAngle(1, 0))).toBe(90)
    expect(deg(vectorAngle(0, 1))).toBe(180)
    expect(deg(vectorAngle(-1, 0))).toBe(270)
  })
})

describe("wedgeIndex", () => {
  it("centers each wedge on its item", () => {
    // Four items: up, right, down, left. Each wedge spans 45° on both sides.
    expect(wedgeIndex(degToRad(0), 4)).toBe(0)
    expect(wedgeIndex(degToRad(44), 4)).toBe(0)
    expect(wedgeIndex(degToRad(46), 4)).toBe(1)
    expect(wedgeIndex(degToRad(350), 4)).toBe(0)
    expect(wedgeIndex(degToRad(270), 4)).toBe(3)
  })

  it("follows the start angle", () => {
    expect(wedgeIndex(degToRad(90), 4, degToRad(90))).toBe(0)
  })

  it("returns -1 for an empty menu", () => {
    expect(wedgeIndex(0, 0)).toBe(-1)
  })
})

describe("nearestIndex", () => {
  const angles = layoutItems(8, 100).map((layout) => layout.angle)

  it("picks the closest enabled item", () => {
    expect(nearestIndex(degToRad(40), angles, Array(8).fill(true))).toBe(1)
  })

  it("skips disabled items", () => {
    const enabled = [true, false, true, true, true, true, true, true]
    expect(nearestIndex(degToRad(45), angles, enabled)).toBe(0)
  })

  it("returns -1 when nothing is enabled", () => {
    expect(nearestIndex(0, angles, Array(8).fill(false))).toBe(-1)
  })
})

describe("stepIndex", () => {
  it("wraps around and skips disabled items", () => {
    const enabled = [true, false, true]
    expect(stepIndex(0, 1, enabled)).toBe(2)
    expect(stepIndex(2, 1, enabled)).toBe(0)
    expect(stepIndex(0, -1, enabled)).toBe(2)
    expect(stepIndex(-1, 1, enabled)).toBe(0)
  })
})

describe("angularDistance", () => {
  it("takes the short way around", () => {
    expect(deg(angularDistance(degToRad(350), degToRad(10)))).toBe(20)
  })
})

describe("shortestRotation", () => {
  it("never turns more than half a circle", () => {
    expect(shortestRotation(350, 10)).toBe(370)
    expect(shortestRotation(10, 350)).toBe(-10)
    expect(shortestRotation(720, 90)).toBe(810)
  })
})

describe("menuExtents and clampCenter", () => {
  const layouts = layoutItems(4, 100)
  const sizes = Array(4).fill({ width: 80, height: 20 })
  const extents = menuExtents(layouts, sizes)

  it("grows item boxes away from the center", () => {
    // The right item starts at the anchor, the left item ends at it.
    expect(extents.right).toBeCloseTo(180)
    expect(extents.left).toBeCloseTo(-180)
    expect(extents.top).toBeCloseTo(-120)
    expect(extents.bottom).toBeCloseTo(120)
  })

  it("moves the center away from the viewport edges", () => {
    const viewport = { width: 1000, height: 800 }
    expect(clampCenter({ x: 20, y: 400 }, extents, viewport, 8)).toEqual({ x: 188, y: 400 })
    expect(clampCenter({ x: 500, y: 790 }, extents, viewport, 8)).toEqual({ x: 500, y: 672 })
  })

  it("shrinks a menu that is wider than the viewport", () => {
    expect(fitScale(extents, { width: 1000, height: 800 })).toBe(1)
    expect(fitScale(extents, { width: 196, height: 800 }, 8)).toBeCloseTo(0.5)
  })
})
