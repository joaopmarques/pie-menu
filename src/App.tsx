import type { ReactNode } from "react"
import { Heart } from "lucide-react"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { AgentSetupButton } from "@/demo/agent-setup"
import { ContextMenuDemo, ReactionDemo } from "@/demo/basic-demos"
import { CodeBlock } from "@/demo/code-block"
import { GitHubLink } from "@/demo/github-link"
import { Guide } from "@/demo/guide"
import { MaximalistDemo } from "@/demo/maximalist-demo"
import { RoomDemo } from "@/demo/room-demo"
import { ThemeToggle } from "@/demo/theme-toggle"
import { VideoDemo } from "@/demo/video-demo"

const KEYS: Array<[string, string]> = [
  [
    "Enter / Space",
    "Open from a focused trigger. Select the highlighted item.",
  ],
  ["Shift+F10 / Menu key", "Open from any trigger."],
  ["Arrow keys", "Pick by direction. Hold two arrows for a diagonal."],
  ["Tab / Shift+Tab", "Walk around the ring."],
  ["Home / End", "First or last item."],
  ["A–Z", "Jump to an item by its first letters."],
  ["Escape", "Close and return focus to the trigger."],
]

const NAV = [
  { href: "#demo", label: "Demo" },
  { href: "#examples", label: "Examples" },
  { href: "#keyboard", label: "Keyboard" },
  { href: "#how-it-works", label: "How it works" },
]

export function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:ring-[3px] focus:ring-ring/50"
      >
        Skip to content
      </a>
      <Toaster />

      <main
        id="main"
        className="mx-auto max-w-5xl space-y-20 px-4 py-12 sm:px-6 sm:py-16"
      >
        <header className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              shadcn/ui registry component
            </p>
            <div className="flex items-center gap-2">
              <GitHubLink />
              <ThemeToggle />
            </div>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Pie Menu
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A radial menu for React, in the tradition of Don Hopkins&apos; pie
            menus. Every item is one short flick away. Press, drag toward an
            option, and let go. After a while, you do not need to look.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <AgentSetupButton className="sm:self-stretch" />
            <em className="text-center text-sm text-muted-foreground">or</em>
            <CodeBlock
              code="npx shadcn@latest add https://piemenu.jpmarqu.es/r/pie-menu.json"
              className="min-w-0 flex-1"
            />
          </div>
          <nav aria-label="On this page">
            <ul className="flex flex-wrap gap-2">
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <VideoDemo />
        </header>

        <Section
          id="demo"
          title="Try it: a life-sim room"
          description="Every object opens a pie with the character at the center. The head follows your aim, and the chosen action goes to the queue."
        >
          <RoomDemo />
        </Section>

        <Section
          id="examples"
          title="More examples"
          description="The same component with different settings and styles."
        >
          <div className="grid gap-10 md:grid-cols-2">
            <SubSection
              title="Context menu"
              description='openOn="contextmenu". It works with right click, long press, and Shift+F10.'
            >
              <ContextMenuDemo />
            </SubSection>
            <SubSection
              title="Icon only"
              description='openOn="press", a small radius, and an aria-label on each item.'
            >
              <ReactionDemo />
            </SubSection>
            <SubSection
              className="md:col-span-2"
              title="Maximalist"
              description="The headless primitive with its own CSS and no shadcn/ui styles. Same logic, same keyboard support, totally different look."
            >
              <MaximalistDemo />
            </SubSection>
          </div>
        </Section>

        <Section
          id="keyboard"
          title="Keyboard"
          description="The menu uses the ARIA menu pattern, with a few extras for the ring."
        >
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <tbody>
                {KEYS.map(([key, action]) => (
                  <tr key={key} className="border-b last:border-0">
                    <th
                      scope="row"
                      className="w-48 bg-muted/40 px-4 py-2.5 text-left font-medium whitespace-nowrap"
                    >
                      {key}
                    </th>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="how-it-works"
          title="How it works"
          description="Everything a developer needs to know, in nine short steps."
        >
          <Guide />
        </Section>

        <footer className="flex flex-col gap-6 border-t pt-8 text-sm text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p>
              Based on the pie menus of Don Hopkins, Jack Callahan, and Mark
              Weiser (University of Maryland, 1986), and the marking menus of
              Gordon Kurtenbach and Bill Buxton.
            </p>
            <p>
              Made with{" "}
              <Heart
                aria-hidden="true"
                className="inline size-4 fill-red-500 align-[-0.125em] text-red-500 dark:fill-red-400 dark:text-red-400"
              />
              <span className="sr-only">love</span> by{" "}
              <a
                href="https://jpmarqu.es"
                className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none hover:text-foreground/80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                jpmarqu.es
              </a>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start">
            <GitHubLink />
            <ThemeToggle />
          </div>
        </footer>
      </main>
    </>
  )
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-8 space-y-6"
    >
      <div className="space-y-1">
        <h2
          id={`${id}-title`}
          className="text-2xl font-semibold tracking-tight"
        >
          {title}
        </h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function SubSection({
  title,
  description,
  className,
  children,
}: {
  title: string
  description: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}
