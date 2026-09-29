import { useEffect, useLayoutEffect, useState, type RefObject } from "react"

/**
 * - `starting`: first frame after mount. Styles show the enter start state.
 * - `entering`: enter transitions run. Use it for enter-only effects, such as a stagger.
 * - `open`: idle.
 * - `ending`: exit transitions run. The element unmounts when they finish.
 */
export type PresenceStatus = "starting" | "entering" | "open" | "ending"

/**
 * Keeps an element mounted while its CSS transitions finish, in the style of
 * Base UI's `data-starting-style` and `data-ending-style`. It waits on the Web
 * Animations API, so it works with transitions and keyframes and needs no timers.
 */
export function usePresence(present: boolean, ref: RefObject<HTMLElement | null>) {
  const [mounted, setMounted] = useState(present)
  const [status, setStatus] = useState<PresenceStatus>(present ? "open" : "ending")

  useLayoutEffect(() => {
    if (present) {
      setMounted(true)
      setStatus("starting")
    } else {
      setStatus((current) => (current === "starting" ? current : "ending"))
    }
  }, [present])

  useEffect(() => {
    if (!mounted) return
    let cancelled = false
    let frame = 0

    if (status === "starting") {
      // Two frames: the browser must paint the start state before it can transition from it.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setStatus(present ? "entering" : "ending"))
      })
    } else if (status === "entering" || status === "ending") {
      frame = requestAnimationFrame(() => {
        waitForAnimations(ref.current).then(() => {
          if (cancelled) return
          if (status === "entering") setStatus("open")
          else setMounted(false)
        })
      })
    }

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [mounted, status, present, ref])

  return { mounted, status }
}

function waitForAnimations(element: HTMLElement | null) {
  if (!element || typeof element.getAnimations !== "function") return Promise.resolve()
  // Skip endless animations, such as a spinner inside the element. They never finish.
  const animations = element
    .getAnimations({ subtree: true })
    .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
  return Promise.allSettled(animations.map((animation) => animation.finished))
}
