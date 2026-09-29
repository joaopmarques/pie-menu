import { useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"
import { Check, ClipboardPaste, Copy, CopyPlus, Scissors, Share2, Trash2 } from "lucide-react"

import {
  PieMenu,
  PieMenuContent,
  PieMenuIndicator,
  PieMenuItem,
  PieMenuTrigger,
} from "@/components/ui/pie-menu"
import "@/index.css"
import "./video.css"

// The same items as ContextMenuDemo in src/demo/basic-demos.tsx.
const EDIT_ACTIONS = [
  { label: "Copy", icon: Copy, done: "Copied" },
  { label: "Cut", icon: Scissors, done: "Cut" },
  { label: "Paste", icon: ClipboardPaste, done: "Pasted" },
  { label: "Duplicate", icon: CopyPlus, done: "Duplicated" },
  { label: "Share", icon: Share2, done: "Shared" },
]

/** A macOS-style arrow cursor. It follows the real pointer events that the recorder sends. */
function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [press, setPress] = useState(0)
  const [down, setDown] = useState(false)

  useEffect(() => {
    const move = (event: PointerEvent) => {
      ref.current?.style.setProperty("translate", `${event.clientX}px ${event.clientY}px`)
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
    <div ref={ref} className="video-cursor" style={{ translate: "-100px -100px" }} aria-hidden>
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

function Toast({ text, onDone }: { text: string; onDone: () => void }) {
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

function Recording() {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const show = (text: string) => setToast((current) => ({ id: (current?.id ?? 0) + 1, text }))

  return (
    <>
      <PieMenu>
        <PieMenuTrigger asChild openOn="press" aria-label="Canvas">
          <div className="fixed inset-0 bg-background outline-none" />
        </PieMenuTrigger>
        <PieMenuContent>
          <PieMenuIndicator />
          {EDIT_ACTIONS.map(({ label, icon: Icon, done }) => (
            <PieMenuItem key={label} onSelect={() => show(done)}>
              <Icon />
              {label}
            </PieMenuItem>
          ))}
          <PieMenuItem variant="destructive" onSelect={() => show("Deleted")}>
            <Trash2 />
            Delete
          </PieMenuItem>
        </PieMenuContent>
      </PieMenu>
      {toast && <Toast key={toast.id} text={toast.text} onDone={() => setToast(null)} />}
      <Cursor />
    </>
  )
}

createRoot(document.getElementById("root")!).render(<Recording />)
