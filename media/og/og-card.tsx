import {
  PieMenu,
  PieMenuCenter,
  PieMenuContent,
  PieMenuIndicator,
  PieMenuItem,
  PieMenuTrigger,
} from "@/components/ui/pie-menu"
import { CharacterAvatar } from "@/demo/character"
import { SELF_ACTIONS } from "@/demo/room-actions"

// Six items keep the ring narrow enough to sit beside the title. Short labels go on the right, near the card edge.
const ITEMS = [
  "Dance",
  "Wave",
  "Stretch",
  "Daydream",
  "Tell a Joke",
  "Hum a Tune",
].map((label) => SELF_ACTIONS.find((action) => action.label === label)!)

// The card is 800x420 CSS px. The render script captures it at 1.5x scale, so the PNG is 1200x630.
export const CARD = { width: 800, height: 420 }
// The menu opens from the center of the hidden trigger.
export const MENU_CENTER = { x: 620, y: 214 }

export function OgCard() {
  return (
    <main
      className="relative overflow-hidden bg-background text-foreground"
      style={{ width: CARD.width, height: CARD.height }}
    >
      {/* A quiet dot grid, so the white card does not look empty at thumbnail size. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(var(--border) 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px",
          maskImage:
            "radial-gradient(circle at 76% 51%, black 0, black 38%, transparent 70%)",
        }}
      />

      <div className="absolute top-[52px] left-[48px] flex w-[340px] flex-col">
        <span className="inline-flex w-fit items-center rounded-full border bg-background px-3 py-1 text-[13px] font-medium text-muted-foreground shadow-xs">
          shadcn/ui registry
        </span>
        <h1 className="mt-5 text-[64px] leading-[1] font-bold tracking-[-0.04em]">
          Pie Menu
        </h1>
        <p className="mt-4 text-[22px] leading-[1.3] font-medium tracking-[-0.01em] text-balance text-muted-foreground">
          A radial menu for React and shadcn/ui.
        </p>
        <div className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg border bg-muted px-3 py-2 font-mono text-[13px] text-foreground">
          <span className="text-muted-foreground">$</span>
          npx shadcn add @jpmarques/pie-menu
        </div>
      </div>

      <p className="absolute bottom-[40px] left-[48px] font-mono text-[13px] text-muted-foreground">
        piemenu.jpmarqu.es
      </p>

      <PieMenu defaultOpen>
        <PieMenuTrigger
          aria-label="Pip"
          className="absolute size-px opacity-0"
          style={{ left: MENU_CENTER.x, top: MENU_CENTER.y }}
        />
        <PieMenuContent
          radius={104}
          deadZone={30}
          collisionPadding={30}
          returnFocus={false}
        >
          <PieMenuIndicator className="size-32" />
          <PieMenuCenter>
            <CharacterAvatar />
          </PieMenuCenter>
          {ITEMS.map((action) => (
            <PieMenuItem key={action.label}>
              <action.icon />
              {action.label}
            </PieMenuItem>
          ))}
        </PieMenuContent>
      </PieMenu>
    </main>
  )
}
