import { useState } from "react"
import {
  ClipboardPaste,
  Copy,
  CopyPlus,
  Scissors,
  Share2,
  SmilePlus,
  Trash2,
} from "lucide-react"

import {
  PieMenu,
  PieMenuContent,
  PieMenuIndicator,
  PieMenuItem,
  PieMenuTrigger,
} from "@/components/ui/pie-menu"

const EDIT_ACTIONS = [
  { label: "Copy", icon: Copy },
  { label: "Cut", icon: Scissors },
  { label: "Paste", icon: ClipboardPaste },
  { label: "Duplicate", icon: CopyPlus },
  { label: "Share", icon: Share2 },
]

const REACTIONS = [
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🔥", label: "Fire" },
]

export function ContextMenuDemo() {
  const [last, setLast] = useState<string | null>(null)
  return (
    <div className="space-y-2">
      <PieMenu>
        <PieMenuTrigger
          asChild
          openOn="contextmenu"
          aria-label="Canvas. Open the context menu with Enter, right click, long press, or Shift+F10."
        >
          <div
            role="button"
            tabIndex={0}
            className="grid h-56 place-items-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:border-ring"
          >
            Right-click or long-press here
          </div>
        </PieMenuTrigger>
        <PieMenuContent>
          <PieMenuIndicator />
          {EDIT_ACTIONS.map(({ label, icon: Icon }) => (
            <PieMenuItem key={label} onSelect={() => setLast(label)}>
              <Icon />
              {label}
            </PieMenuItem>
          ))}
          <PieMenuItem variant="destructive" onSelect={() => setLast("Delete")}>
            <Trash2 />
            Delete
          </PieMenuItem>
        </PieMenuContent>
      </PieMenu>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Last action:{" "}
        <span className="font-medium text-foreground">{last ?? "none"}</span>
      </p>
    </div>
  )
}

export function ReactionDemo() {
  const [reaction, setReaction] = useState<string | null>(null)
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border bg-muted/30">
      <PieMenu>
        <PieMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent">
          <SmilePlus className="size-4" />
          React
        </PieMenuTrigger>
        <PieMenuContent radius={68} deadZone={18}>
          <PieMenuIndicator />
          {REACTIONS.map(({ emoji, label }) => (
            <PieMenuItem
              key={label}
              aria-label={label}
              textValue={label}
              className="size-11 justify-center p-0 text-xl"
              onSelect={() => setReaction(`${emoji} ${label}`)}
            >
              {emoji}
            </PieMenuItem>
          ))}
        </PieMenuContent>
      </PieMenu>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {reaction ? `You reacted with ${reaction}` : "Press, flick, release."}
      </p>
    </div>
  )
}
