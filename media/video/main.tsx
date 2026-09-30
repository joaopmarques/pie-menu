import { useState } from "react"
import {
  ClipboardPaste,
  Copy,
  CopyPlus,
  Scissors,
  Share2,
  Trash2,
} from "lucide-react"
import { createRoot } from "react-dom/client"

import {
  PieMenu,
  PieMenuContent,
  PieMenuIndicator,
  PieMenuItem,
  PieMenuTrigger,
} from "@/components/ui/pie-menu"

import { Cursor, Toast } from "./scene-parts"

import "@/index.css"

// The same items as ContextMenuDemo in src/demo/basic-demos.tsx.
const EDIT_ACTIONS = [
  { label: "Copy", icon: Copy, done: "Copied" },
  { label: "Cut", icon: Scissors, done: "Cut" },
  { label: "Paste", icon: ClipboardPaste, done: "Pasted" },
  { label: "Duplicate", icon: CopyPlus, done: "Duplicated" },
  { label: "Share", icon: Share2, done: "Shared" },
]

function Recording() {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const show = (text: string) =>
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text }))

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
      {toast && (
        <Toast key={toast.id} text={toast.text} onDone={() => setToast(null)} />
      )}
      <Cursor />
    </>
  )
}

createRoot(document.getElementById("root")!).render(<Recording />)
