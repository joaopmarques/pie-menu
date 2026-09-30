import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  PieMenu,
  PieMenuCenter,
  PieMenuContent,
  PieMenuIndicator,
  PieMenuItem,
  PieMenuTrigger,
} from "@/components/ui/pie-menu"

import { CharacterAvatar, CharacterHead, PIP, ThoughtBubble } from "./character"
import { ROOM_OBJECTS, SELF_ACTIONS, type RoomAction } from "./room-actions"

const MAX_QUEUE = 5
const LOOK_RANGE = 260

interface QueuedAction {
  id: number
  label: string
  icon: LucideIcon
}

export function RoomDemo() {
  const [queue, setQueue] = useState<QueuedAction[]>([])
  const [announcement, setAnnouncement] = useState("")
  const nextId = useRef(0)
  const characterRef = useRef<HTMLDivElement>(null)

  const enqueue = (action: RoomAction, target: string) => {
    if (queue.length >= MAX_QUEUE) {
      setAnnouncement(`The queue is full. Pip can hold ${MAX_QUEUE} actions.`)
      return
    }
    const id = nextId.current++
    setQueue((current) => [
      ...current,
      { id, label: action.label, icon: action.icon },
    ])
    setAnnouncement(`Pip queued ${action.label} on ${target}.`)
  }

  // Outside the menu, the character in the room follows the pointer with the same CSS variables.
  const lookAt = (event: ReactPointerEvent) => {
    const character = characterRef.current
    if (!character) return
    const rect = character.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 3)
    const scale =
      Math.min(Math.hypot(dx, dy) / LOOK_RANGE, 1) / (Math.hypot(dx, dy) || 1)
    character.style.setProperty("--pie-aim-x", String(dx * scale))
    character.style.setProperty("--pie-aim-y", String(dy * scale))
  }

  const resetLook = () => {
    characterRef.current?.style.setProperty("--pie-aim-x", "0")
    characterRef.current?.style.setProperty("--pie-aim-y", "0")
  }

  return (
    <div className="space-y-3">
      <div
        className="relative h-[480px] w-full overflow-hidden rounded-xl border bg-card shadow-sm"
        onPointerMove={lookAt}
        onPointerLeave={resetLook}
      >
        <Wallpaper />

        <ActionQueue
          queue={queue}
          onDone={() => setQueue((current) => current.slice(1))}
        />

        {ROOM_OBJECTS.map((object) => (
          <PieMenu key={object.id}>
            <PieMenuTrigger
              aria-label={object.name}
              className="group absolute -translate-1/2 rounded-2xl outline-none"
              style={{ left: `${object.x}%`, top: `${object.y}%` }}
            >
              <ObjectTile icon={object.icon} name={object.name} />
            </PieMenuTrigger>
            <ActionPieContent
              actions={object.actions}
              onChoose={(action) => enqueue(action, object.name)}
            />
          </PieMenu>
        ))}

        <PieMenu>
          <PieMenuTrigger
            aria-label="Pip"
            className="group absolute -translate-1/2 rounded-2xl outline-none"
            style={{ left: "44%", top: "68%" }}
          >
            <CharacterFigure ref={characterRef} />
          </PieMenuTrigger>
          <ActionPieContent
            actions={SELF_ACTIONS}
            onChoose={(action) => enqueue(action, "Pip")}
          />
        </PieMenu>

        <p className="absolute right-3 bottom-3 left-3 text-xs text-muted-foreground sm:right-auto">
          Press an object, drag toward an action, and let go. Or click it and
          click again. Keyboard: Tab to an object, then Enter.
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

export function ActionPieContent({
  actions,
  onChoose,
}: {
  actions: RoomAction[]
  onChoose: (action: RoomAction) => void
}) {
  return (
    <PieMenuContent radius={124} deadZone={30}>
      <PieMenuIndicator className="size-32" />
      <PieMenuCenter>
        <CharacterAvatar look={PIP} />
      </PieMenuCenter>
      {actions.map((action) => (
        <PieMenuItem
          key={action.label}
          disabled={action.disabled}
          onSelect={() => onChoose(action)}
        >
          <action.icon />
          {action.label}
        </PieMenuItem>
      ))}
    </PieMenuContent>
  )
}

export function ObjectTile({
  icon: Icon,
  name,
}: {
  icon: LucideIcon
  name: string
}) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span
        className={cn(
          "grid size-14 place-items-center rounded-2xl border bg-card text-foreground shadow-md transition-[translate,box-shadow] duration-200 ease-out sm:size-16",
          "group-hover:-translate-y-1 group-hover:shadow-lg group-data-[state=open]:-translate-y-1 group-data-[state=open]:ring-2 group-data-[state=open]:ring-ring",
          "group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50 motion-reduce:transition-none"
        )}
      >
        <Icon className="size-7 sm:size-8" strokeWidth={1.6} />
      </span>
      <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
        {name}
      </span>
    </span>
  )
}

function CharacterFigure({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center rounded-2xl px-2 pt-8 pb-1 transition-[translate] duration-200 group-hover:-translate-y-1 group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50 motion-reduce:transition-none"
    >
      <ThoughtBubble className="absolute top-0 left-[60%] h-7" />
      <CharacterHead className="relative z-10 -mb-3 size-16" />
      <svg viewBox="0 0 60 64" className="w-14" aria-hidden>
        <rect x="19" y="40" width="9" height="20" rx="4" fill="#334155" />
        <rect x="32" y="40" width="9" height="20" rx="4" fill="#334155" />
        <ellipse cx="23" cy="61" rx="6" ry="3" fill="#1e293b" />
        <ellipse cx="37" cy="61" rx="6" ry="3" fill="#1e293b" />
        <rect
          x="8"
          y="10"
          width="8"
          height="26"
          rx="4"
          fill={PIP.skin}
          transform="rotate(10 12 10)"
        />
        <rect
          x="44"
          y="10"
          width="8"
          height="26"
          rx="4"
          fill={PIP.skin}
          transform="rotate(-10 48 10)"
        />
        <rect x="14" y="4" width="32" height="40" rx="11" fill={PIP.shirt} />
        <path
          d="M24 5 L30 13 L36 5"
          stroke="#fff"
          strokeOpacity="0.5"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      <span className="-mt-1 h-2 w-14 rounded-full bg-foreground/10 blur-[2px]" />
      <span className="mt-1 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
        Pip
      </span>
    </div>
  )
}

function ActionQueue({
  queue,
  onDone,
}: {
  queue: QueuedAction[]
  onDone: () => void
}) {
  const current = queue[0]
  return (
    <div className="absolute top-3 left-3 z-10 space-y-1.5">
      <ol aria-label="Action queue" className="flex gap-1.5">
        {Array.from({ length: MAX_QUEUE }, (_, index) => {
          const item = queue[index]
          if (!item) {
            return (
              <li
                key={`empty-${index}`}
                aria-hidden
                className="size-10 rounded-xl border border-dashed bg-background/40"
              />
            )
          }
          return (
            <li
              key={item.id}
              title={item.label}
              className="relative grid size-10 animate-in place-items-center overflow-hidden rounded-xl border bg-card shadow-sm duration-200 zoom-in-75 fade-in"
            >
              <item.icon className="size-5" strokeWidth={1.8} />
              <span className="sr-only">{item.label}</span>
              {index === 0 && (
                <span className="absolute inset-x-1.5 bottom-1 h-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="queue-progress block h-full rounded-full bg-green-500"
                    onAnimationEnd={onDone}
                  />
                </span>
              )}
            </li>
          )
        })}
      </ol>
      <p className="text-xs font-medium text-muted-foreground">
        {current ? (
          <>
            Pip is doing:{" "}
            <span className="text-foreground">{current.label}</span>
          </>
        ) : (
          "Pip is idle."
        )}
      </p>
    </div>
  )
}

export function Wallpaper() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 top-0 h-[52%] bg-muted/60 bg-[repeating-linear-gradient(90deg,transparent_0_26px,color-mix(in_oklch,var(--foreground)_4%,transparent)_26px_52px)]" />
      <div className="absolute inset-x-0 top-[52%] h-2 bg-foreground/10" />
      <div className="absolute inset-x-0 top-[calc(52%+8px)] bottom-0 bg-[repeating-conic-gradient(color-mix(in_oklch,var(--foreground)_5%,transparent)_0_25%,transparent_0_50%)] bg-size-[56px_56px]" />
    </div>
  )
}
