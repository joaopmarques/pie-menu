import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"

import "./video.css"

/* Shared parts of the recording scenes. */

/** A macOS-style arrow cursor. It follows the real pointer events that the recorder sends. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [press, setPress] = useState(0)
  const [down, setDown] = useState(false)

  useEffect(() => {
    const move = (event: PointerEvent) => {
      ref.current?.style.setProperty(
        "translate",
        `${event.clientX}px ${event.clientY}px`
      )
    }
    const onDown = (event: PointerEvent) => {
      move(event)
      setDown(true)
      setPress((count) => count + 1)
    }
    const onUp = (event: PointerEvent) => {
      move(event)
      setDown(false)
    }
    const options = { capture: true }
    window.addEventListener("pointermove", move, options)
    window.addEventListener("pointerdown", onDown, options)
    window.addEventListener("pointerup", onUp, options)
    return () => {
      window.removeEventListener("pointermove", move, options)
      window.removeEventListener("pointerdown", onDown, options)
      window.removeEventListener("pointerup", onUp, options)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="video-cursor"
      style={{ translate: "-100px -100px" }}
      aria-hidden
    >
      {press > 0 && <span key={press} className="video-press-ring" />}
      <svg
        className="video-cursor-arrow"
        data-down={down ? "" : undefined}
        width="20"
        height="28"
        viewBox="0 0 20 28"
        fill="none"
      >
        <path
          d="M1.5 1.5 L1.5 22.2 L6.3 17.6 L9.6 25.3 L13.1 23.8 L9.9 16.3 L16.6 16.3 Z"
          fill="#000"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  return (
    <div className="video-toast-wrap">
      <div className="video-toast" onAnimationEnd={onDone}>
        <span className="video-toast-check">
          <Check />
        </span>
        {text}
      </div>
    </div>
  )
}
