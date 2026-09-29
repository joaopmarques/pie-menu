import { useMemo, useRef, useState, type CSSProperties } from "react"

import * as Pie from "@/lib/pie-menu/primitive"

import "./maximalist.css"

interface Snack {
  emoji: string
  label: string
  color: string
  /** Visible label, when it differs from `label`. */
  display?: string
  secret?: boolean
}

const SNACKS: Snack[] = [
  { emoji: "🍕", label: "Pizza", color: "#ff3d7f" },
  { emoji: "🌮", label: "Taco", color: "#ffb300" },
  { emoji: "🍣", label: "Sushi", color: "#00c2a8" },
  { emoji: "🍩", label: "Donut", color: "#a855f7" },
  { emoji: "🍔", label: "Burger", color: "#ff6b1a" },
  { emoji: "🍜", label: "Ramen", color: "#3b82f6" },
]

// The easter egg: move between these two items this many times, and a secret item appears between them.
const EGG_PAIR = ["Taco", "Sushi"] as const
const EGG_LABELS = new Set<string>(EGG_PAIR)
const EGG_SWITCHES = 3
const SURPRISE_MS = 900
// The soft hyphen lets the long word break inside the round sticker.
const SECRET: Snack = {
  emoji: "💊",
  label: "Antidepressant",
  display: "Anti\u00ADdepressant",
  color: "#ff4fd8",
  secret: true,
}
const SECRET_MESSAGE = "The world needs more joy. Keep being awesome! ❤️"

/**
 * The same pie menu logic with completely different styles.
 * It uses the headless primitive from lib/pie-menu, not the shadcn/ui layer.
 */
export function MaximalistDemo() {
  const [order, setOrder] = useState<{ key: number; text: string } | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const [surprise, setSurprise] = useState(false)
  const trail = useRef<{ last: string | null; switches: number }>({
    last: null,
    switches: 0,
  })

  const snacks = useMemo(() => {
    if (!unlocked) return SNACKS
    const index = SNACKS.findIndex(({ label }) => label === EGG_PAIR[1])
    return [...SNACKS.slice(0, index), SECRET, ...SNACKS.slice(index)]
  }, [unlocked])

  const { disc, wedge } = useMemo(() => pieShapes(snacks), [snacks])

  // Count moves from one egg item to the other. The same item again (for example after a
  // trip through the center) keeps the count. Any other item resets it.
  const track = (label: string) => {
    if (unlocked) return
    const { last, switches } = trail.current
    if (label === last) return
    const isSwitch =
      EGG_LABELS.has(label) && last !== null && EGG_LABELS.has(last)
    trail.current = { last: label, switches: isSwitch ? switches + 1 : 0 }
    if (trail.current.switches < EGG_SWITCHES) return
    setUnlocked(true)
    setSurprise(true)
    window.setTimeout(() => setSurprise(false), SURPRISE_MS)
    setAnnouncement(
      `A secret item appeared between ${EGG_PAIR[0]} and ${EGG_PAIR[1]}.`
    )
  }

  const choose = (snack: Snack) =>
    setOrder((current) => ({
      key: (current?.key ?? 0) + 1,
      text: snack.secret
        ? SECRET_MESSAGE
        : `Order up: ${snack.emoji} ${snack.label}!`,
    }))

  return (
    <div className="maxi-stage">
      <Pie.Root>
        <Pie.Trigger className="maxi-trigger">
          <span aria-hidden>🍽️</span> Hungry? Hold me
        </Pie.Trigger>
        <Pie.Content
          className="maxi-menu"
          data-surprise={surprise ? "" : undefined}
          radius={176}
          deadZone={56}
          aria-label="Snack menu"
        >
          <Pie.Center
            className="maxi-disc"
            style={{ "--maxi-disc": disc } as CSSProperties}
          />
          <Pie.Indicator className="maxi-wedge">
            <svg viewBox="-100 -100 200 200">
              <path d={wedge} />
            </svg>
          </Pie.Indicator>
          <Pie.Center className="maxi-hub">
            <span className="maxi-hub__arrow" />
            <span className="maxi-hub__text">Yum</span>
          </Pie.Center>
          {snacks.map((snack) => (
            <Pie.Item
              key={snack.label}
              className="maxi-item"
              data-secret={snack.secret ? "" : undefined}
              textValue={snack.label}
              style={{ "--maxi-item": snack.color } as CSSProperties}
              onHighlight={() => track(snack.label)}
              onSelect={() => choose(snack)}
            >
              <span className="maxi-item__emoji" aria-hidden>
                {snack.emoji}
              </span>
              <span className="maxi-item__label">
                {snack.display ?? snack.label}
              </span>
            </Pie.Item>
          ))}
        </Pie.Content>
      </Pie.Root>

      <p className="maxi-order" aria-live="polite">
        {order ? (
          <span key={order.key} className="maxi-order__pop">
            {order.text}
          </span>
        ) : (
          "Press, flick, release. No shadcn styles here."
        )}
      </p>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}

/** One colored disc slice per item, and a wedge as wide as one slice that points up. */
function pieShapes(snacks: Snack[]) {
  const slice = 360 / snacks.length
  const disc = `conic-gradient(from ${-slice / 2}deg, ${snacks
    .map(({ color }, index) => {
      const tint = `color-mix(in oklch, ${color} 32%, var(--maxi-paper))`
      return `${tint} ${index * slice}deg ${(index + 1) * slice}deg`
    })
    .join(", ")})`
  const half = (slice / 2) * (Math.PI / 180)
  const x = 98 * Math.sin(half)
  const y = -98 * Math.cos(half)
  const wedge = `M0 0 L${-x} ${y} A98 98 0 0 1 ${x} ${y} Z`
  return { disc, wedge }
}
