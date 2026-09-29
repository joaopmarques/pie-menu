import type { ReactNode } from "react"
import { Crosshair, Focus, Keyboard, Maximize, MousePointerClick, Sparkles } from "lucide-react"

import { CodeBlock } from "./code-block"

const INSTALL = "npx shadcn@latest add https://piemenu.jpmarqu.es/r/pie-menu.json"

const BASIC_USAGE = `<PieMenu>
  <PieMenuTrigger>Edit</PieMenuTrigger>
  <PieMenuContent>
    <PieMenuItem onSelect={() => copy()}>Copy</PieMenuItem>
    <PieMenuItem onSelect={() => paste()}>Paste</PieMenuItem>
    <PieMenuItem onSelect={() => remove()}>Delete</PieMenuItem>
  </PieMenuContent>
</PieMenu>`

const TRIGGERS = `<PieMenuTrigger>                        {/* opens on a normal press */}
<PieMenuTrigger openOn="contextmenu">   {/* opens on right-click or long-press */}`

const AS_CHILD = `<PieMenuTrigger asChild openOn="contextmenu">
  <div tabIndex={0}>Right-click me</div>
</PieMenuTrigger>`

const AIM_CSS = `.eyes {
  translate: calc(var(--pie-aim-x) * 6px) calc(var(--pie-aim-y) * 4px);
  transition: translate 150ms ease-out;
}`

const PARTS = [
  ["PieMenu", "The box around everything. It remembers whether the menu is open."],
  ["PieMenuTrigger", "The thing the user presses. By default it is a button."],
  ["PieMenuContent", "The ring that pops up."],
  ["PieMenuItem", "One option. Its onSelect runs when the user picks it."],
]

const EXTRAS = [
  ["<PieMenuIndicator />", "Draws a small hub with an arc that points at the current item."],
  ["<PieMenuCenter>", "Puts anything in the middle. The character's head in the demo goes here."],
  ['variant="destructive"', "Makes an item red."],
  ["disabled", "Grays an item out. Its slice stays in place but does nothing."],
  ["onHighlight", "Runs when an item becomes highlighted, by pointer or by keyboard."],
  ["Live items", "Render a new item while the menu is open. The ring makes room, and the item grows in."],
]

const FREEBIES = [
  { icon: Sparkles, title: "Animations", text: "Items grow out on open and fold back in on close." },
  { icon: Maximize, title: "Stays on screen", text: "It moves away from edges and shrinks on small phones." },
  { icon: Focus, title: "Focus", text: "Into the menu on open, back to the trigger on close." },
  { icon: Keyboard, title: "Keyboard and screen readers", text: "ARIA menu roles, arrow keys, typeahead, and Escape." },
]

export function Guide() {
  return (
    <div className="space-y-12">
      <Step number={1} title="Install it">
        <p>One command adds the files to your project, the same way any shadcn/ui component does.</p>
        <CodeBlock code={INSTALL} />
        <p>After that, the code is yours. You can read it, change it, and restyle it.</p>
      </Step>

      <Step number={2} title="Write four parts">
        <p>The parts nest like a normal dropdown menu.</p>
        <CodeBlock code={BASIC_USAGE} />
        <DefinitionList rows={PARTS} />
        <p>That is all you need for a working pie menu.</p>
      </Step>

      <Step number={3} title="Let it place the items">
        <p>You do not position anything. You list the items, and the menu puts them in a circle.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>The first item goes at the top (12 o&apos;clock).</li>
          <li>The next items go clockwise, evenly spaced.</li>
          <li>Labels grow away from the center, so they do not cover each other.</li>
        </ol>
        <p>
          To start somewhere else, set <InlineCode>startAngle</InlineCode>. For example,{" "}
          <InlineCode>startAngle={"{90}"}</InlineCode> starts at 3 o&apos;clock.
        </p>
      </Step>

      <Step number={4} title="Know how the user picks">
        <div className="grid items-center gap-6 sm:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            <p>
              The menu looks at the <strong className="font-medium text-foreground">direction</strong> of the
              pointer, not the exact spot. Picture the screen cut into pizza slices, one slice per item. The pointer
              can be anywhere in a slice, even near the screen edge, and that item is picked.
            </p>
            <ul className="space-y-2">
              <Bullet icon={Crosshair} label="Flick">
                Press, drag toward an item, and let go.
              </Bullet>
              <Bullet icon={MousePointerClick} label="Click twice">
                Click the trigger, then click an item.
              </Bullet>
              <Bullet icon={Keyboard} label="Keyboard">
                Press Enter, use the arrow keys, then press Enter again.
              </Bullet>
            </ul>
            <p>
              The small circle in the middle is the dead zone. Let go there and nothing happens, so it works as an
              undo button.
            </p>
          </div>
          <SliceDiagram />
        </div>
      </Step>

      <Step number={5} title="Choose a trigger">
        <CodeBlock code={TRIGGERS} />
        <p>
          For your own element instead of a button, use <InlineCode>asChild</InlineCode>:
        </p>
        <CodeBlock code={AS_CHILD} />
        <p>
          Keep the <InlineCode>tabIndex={"{0}"}</InlineCode>. Without it, keyboard users cannot reach the trigger.
        </p>
      </Step>

      <Step number={6} title="Add extras if you want">
        <DefinitionList rows={EXTRAS} />
      </Step>

      <Step number={7} title="Skip the hard parts">
        <p>You do not have to write any of this:</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {FREEBIES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 rounded-xl border bg-card p-4">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-sm">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Step>

      <Step number={8} title="Make things follow the pointer">
        <p>
          While the menu is open, it keeps two CSS variables up to date: <InlineCode>--pie-aim-x</InlineCode> and{" "}
          <InlineCode>--pie-aim-y</InlineCode>. Both go from -1 to 1. Use them in CSS to move anything inside the
          menu. The character's head at the top of this page works this way.
        </p>
        <CodeBlock code={AIM_CSS} />
        <p>React does not re-render on each mouse move, so this stays smooth.</p>
      </Step>

      <Step number={9} title="Restyle it">
        <p>
          It is a shadcn/ui component, so you edit the Tailwind classes in{" "}
          <InlineCode>components/ui/pie-menu.tsx</InlineCode>. The behavior code is in{" "}
          <InlineCode>lib/pie-menu/</InlineCode>, and you almost never need to open it.
        </p>
      </Step>
    </div>
  )
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`step-${number}`} className="grid gap-4 sm:grid-cols-[3rem_1fr]">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-full border bg-background text-sm font-semibold tabular-nums"
      >
        {number}
      </span>
      <div className="min-w-0 space-y-3 text-muted-foreground">
        <h3 id={`step-${number}`} className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {children}
      </div>
    </section>
  )
}

function DefinitionList({ rows }: { rows: string[][] }) {
  return (
    <dl className="divide-y overflow-hidden rounded-xl border">
      {rows.map(([term, description]) => (
        <div key={term} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[13rem_1fr] sm:gap-4">
          <dt>
            <code className="font-mono text-[13px] font-medium text-foreground">{term}</code>
          </dt>
          <dd className="text-sm">{description}</dd>
        </div>
      ))}
    </dl>
  )
}

function Bullet({ icon: Icon, label, children }: { icon: typeof Crosshair; label: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
      <span>
        <strong className="font-medium text-foreground">{label}:</strong> {children}
      </span>
    </li>
  )
}

function InlineCode({ children }: { children: ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">{children}</code>
}

/** Four slices. The pointer is far from the "Right" label but still inside its slice. */
function SliceDiagram() {
  const edge = 120 + 120 * Math.SQRT1_2
  const near = 120 - 120 * Math.SQRT1_2
  const labels = [
    { text: "Up", x: 120, y: 52 },
    { text: "Right", x: 188, y: 120 },
    { text: "Down", x: 120, y: 188 },
    { text: "Left", x: 52, y: 120 },
  ]
  return (
    <figure className="mx-auto w-full max-w-[220px]">
      <svg
        viewBox="0 0 240 240"
        className="w-full"
        role="img"
        aria-label="A circle cut into four slices: up, right, down, and left. The pointer sits near the edge of the right slice, and the right slice is picked."
      >
        <circle cx="120" cy="120" r="119" className="fill-muted/60 stroke-border" />
        <path d={`M120 120 L${edge} ${near} A120 120 0 0 1 ${edge} ${edge} Z`} className="fill-primary/15" />
        <g className="stroke-border" strokeDasharray="4 4">
          <line x1="120" y1="120" x2={edge} y2={near} />
          <line x1="120" y1="120" x2={edge} y2={edge} />
          <line x1="120" y1="120" x2={near} y2={edge} />
          <line x1="120" y1="120" x2={near} y2={near} />
        </g>
        <circle cx="120" cy="120" r="22" className="fill-background stroke-border" />
        {labels.map(({ text, x, y }) => (
          <text
            key={text}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className={text === "Right" ? "fill-foreground text-[13px] font-semibold" : "fill-muted-foreground text-[12px]"}
          >
            {text}
          </text>
        ))}
        <path d="M206 150 l0 16 l4.5 -4.5 l3.5 7.5 l3 -1.5 l-3.5 -7 l6 0 Z" className="fill-foreground stroke-background" strokeWidth="1.2" />
      </svg>
      <figcaption className="mt-2 text-center text-xs">Any point in a slice picks that item.</figcaption>
    </figure>
  )
}
