# Pie Menu

**Website, demo, and guide: [piemenu.jpmarqu.es](https://piemenu.jpmarqu.es)**

A radial menu for React in the shadcn/ui style. Items sit in a ring around the pointer, so each one is a short flick away. The design follows the pie menus of Don Hopkins, Jack Callahan, and Mark Weiser (University of Maryland, 1986), and the marking menus of Gordon Kurtenbach and Bill Buxton.

- Press, drag toward an item, and release. Or click, then click an item.
- Full keyboard support, with ARIA menu roles and focus management.
- Enter and exit animations with CSS transitions. The animations are interruptible and respect `prefers-reduced-motion`.
- The menu stays inside the viewport. It moves away from edges and shrinks on small screens.
- A headless primitive and a styled shadcn/ui layer, in separate files.
- `onHighlight` on each item, for pointer and keyboard highlights.
- Items can join while the menu is open. The ring re-flows, and the new item transitions in.

## Install

The component needs React 19 and Tailwind CSS v4. Run this command in any shadcn/ui project:

```bash
npx shadcn@latest add https://piemenu.jpmarqu.es/r/pie-menu.json
```

To host the registry yourself, clone the repository, run `pnpm registry:build`, and serve the `public/r` folder.

The shadcn command adds these files:

| File | Contents |
| --- | --- |
| `components/ui/pie-menu.tsx` | The styled layer: shadcn/ui tokens, `data-slot`, and Tailwind classes. |
| `lib/pie-menu/primitive.tsx` | The headless parts: state, input, focus, and ARIA. |
| `lib/pie-menu/geometry.ts` | Pure math: angles, wedges, layout, and viewport fit. |
| `lib/pie-menu/aim.ts` | The pointer "aim" store and its CSS variables. |
| `lib/pie-menu/use-presence.ts` | Keeps the menu mounted until its exit transitions finish. |
| `lib/pie-menu/hooks.ts` | Small React helpers. |

The only runtime dependency is `radix-ui`, for `Slot`.

## Usage

```tsx
import { Copy, Scissors, Trash2 } from "lucide-react"

import {
  PieMenu,
  PieMenuContent,
  PieMenuIndicator,
  PieMenuItem,
  PieMenuTrigger,
} from "@/components/ui/pie-menu"

export function Example() {
  return (
    <PieMenu>
      <PieMenuTrigger>Edit</PieMenuTrigger>
      <PieMenuContent>
        <PieMenuIndicator />
        <PieMenuItem onSelect={() => copy()}>
          <Copy />
          Copy
        </PieMenuItem>
        <PieMenuItem onSelect={() => cut()}>
          <Scissors />
          Cut
        </PieMenuItem>
        <PieMenuItem variant="destructive" onSelect={() => remove()}>
          <Trash2 />
          Delete
        </PieMenuItem>
      </PieMenuContent>
    </PieMenu>
  )
}
```

Items go clockwise from the top, in the order you write them. For icon-only items, give each item an `aria-label` and a `textValue`.

## Parts

### `PieMenu`

The root. It holds the open state and renders no element.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | |

### `PieMenuTrigger`

A `button` by default. Use `asChild` to render your own element.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `openOn` | `"press" \| "contextmenu"` | `"press"` | `press`: primary press, Enter, or Space. `contextmenu`: right click or a long press on touch. |
| `asChild` | `boolean` | `false` | With a non-button child in `contextmenu` mode, add `tabIndex={0}` so keyboard users can reach it. |
| `disabled` | `boolean` | | |

In both modes, the ContextMenu key and Shift+F10 open the menu.

### `PieMenuContent`

The ring. It renders into `document.body`, over a full-screen layer that captures pointer input.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `radius` | `number` | `96` | Distance from the center to each item anchor, in px. |
| `deadZone` | `number` | `20` | Radius of the center area that selects nothing, in px. |
| `startAngle` | `number` | `0` | Direction of the first item, in degrees clockwise from 12 o'clock. |
| `collisionPadding` | `number` | `8` | Minimum space to the viewport edges, in px. |
| `returnFocus` | `boolean` | `true` | Move focus back to the trigger on close. |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | | Call `event.preventDefault()` to keep the menu open. |
| `container` | `Element \| null` | `document.body` | Portal target. |
| `overlayProps` | `ComponentProps<"div">` | | Props for the full-screen layer. |

The menu gets its accessible name from the trigger. To set a different name, pass `aria-label`.

### `PieMenuItem`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `onSelect` | `(event: Event) => void` | | Call `event.preventDefault()` to keep the menu open. |
| `disabled` | `boolean` | `false` | The wedge stays in place but selects nothing. |
| `textValue` | `string` | text content | Text for typeahead. |
| `onHighlight` | `() => void` | | Runs when the item becomes the highlighted item, by pointer or by keyboard. |
| `variant` | `"default" \| "destructive"` | `"default"` | Styled layer only. |

### Live items

You can add items while the menu is open. The ring moves the other items to their new places, and the new item transitions in from its `data-starting-style` frame. The highlight stays on the same item. Keep a stable `key` on each item. Items that you remove while the menu is open disappear with no exit transition.

This example adds an item when the user highlights "Copy":

```tsx
function EditMenu() {
  const [more, setMore] = useState(false)
  return (
    <PieMenu>
      <PieMenuTrigger>Edit</PieMenuTrigger>
      <PieMenuContent>
        <PieMenuItem onHighlight={() => setMore(true)}>Copy</PieMenuItem>
        {more && <PieMenuItem key="copy-markdown">Copy as Markdown</PieMenuItem>}
        <PieMenuItem>Paste</PieMenuItem>
      </PieMenuContent>
    </PieMenu>
  )
}
```

### `PieMenuCenter` and `PieMenuIndicator`

`PieMenuCenter` puts content at the center, such as an avatar. It is `aria-hidden` by default. `PieMenuIndicator` draws a hub with an arc that turns toward the highlighted item. The arc always takes the short way around.

### `usePieMenuAim()`

Returns `{ x, y, angle, distance }` for the live aim, inside `PieMenuContent`. This hook renders on every pointer move. For visual effects, use the CSS variables below instead.

## Interaction

| Input | Result |
| --- | --- |
| Press, drag out, release | Selects the item in that direction. |
| Press, drag out, drag back to the center, release | Cancels. |
| Click in place | Keeps the menu open. The next click selects, or cancels in the center. |
| Open with a pointer | Nothing is highlighted until the pointer leaves the center. A keyboard open highlights the first item. |
| Enter or Space on a press trigger | Opens the menu and focuses the first item. |
| Arrow keys | Pick by direction. Hold two arrows for a diagonal. |
| Tab, Shift+Tab | Walk around the ring. |
| Home, End | First or last item. |
| Letters | Jump to the item that starts with the typed text. |
| Enter, Space | Select the highlighted item. |
| Escape | Close without a selection. |

Selection uses the angle only, so each wedge reaches the edge of the screen (Fitts's law). Pointer users do not see focus rings. Keyboard users do.

## Styling hooks

Data attributes:

| Element | Attribute | When |
| --- | --- | --- |
| Trigger, content | `data-state="open" \| "closed"` | Always. |
| Content | `data-starting-style` | First frame. Style the enter start state here. |
| Content | `data-entering` | While the enter transitions run. The styled layer staggers items here. |
| Content | `data-ending-style` | While the exit transitions run. |
| Content | `data-highlighting` | An item is highlighted. |
| Item | `data-highlighted`, `data-disabled`, `data-selected` | `data-selected` marks the chosen item during the exit. |
| Item | `data-starting-style` | The first frame of each item. An item that mounts while the menu is open can transition in from here. |
| Indicator | `data-visible` | An item is highlighted. |

CSS variables:

| Element | Variable |
| --- | --- |
| Content | `--pie-radius`, `--pie-dead-zone` |
| Content | `--pie-aim-x`, `--pie-aim-y` (−1 to 1), `--pie-aim-angle`, `--pie-aim-distance` (0 to 1). The menu writes these directly to the DOM, with no React render. |
| Item | `--pie-item-index`, `--pie-item-angle`, `--pie-item-x`, `--pie-item-y`, `--pie-item-sin`, `--pie-item-cos` |
| Item | `--pie-item-translate`: the final `translate` value. Each label grows away from the center. |
| Indicator | `--pie-indicator-rotate` |

The exit waits for all transitions and finite animations in the content. Endless animations, such as a spinner, do not block the exit.

## Headless use

The styled layer is optional. To build a different look, import the primitive and write your own CSS. The primitive sets the structure, the ARIA roles, the data attributes, and the CSS variables. It places each item at the center with `position: absolute`, so your CSS moves it to the ring.

```tsx
import * as Pie from "@/lib/pie-menu/primitive"

export function SnackMenu() {
  return (
    <Pie.Root>
      <Pie.Trigger className="snack-trigger">Hungry?</Pie.Trigger>
      <Pie.Content className="snack-menu" radius={176} deadZone={56}>
        <Pie.Indicator className="snack-wedge" />
        <Pie.Item className="snack-item" onSelect={() => order("pizza")}>Pizza</Pie.Item>
        <Pie.Item className="snack-item" onSelect={() => order("taco")}>Taco</Pie.Item>
      </Pie.Content>
    </Pie.Root>
  )
}
```

```css
.snack-item {
  translate: calc(var(--pie-item-x) - 50%) calc(var(--pie-item-y) - 50%);
  transition: translate 400ms, scale 200ms, opacity 200ms;
}

.snack-item[data-highlighted] {
  scale: 1.2;
}

/* Enter and exit: start at the center, return to the center. */
.snack-menu[data-starting-style] .snack-item,
.snack-item[data-starting-style],
.snack-menu[data-ending-style] .snack-item {
  translate: -50% -50%;
  opacity: 0;
}

.snack-wedge {
  rotate: var(--pie-indicator-rotate);
  transition: rotate 300ms;
}
```

The parts are `Root`, `Trigger`, `Content`, `Item`, `Center`, and `Indicator`, plus the `usePieMenuAim()` hook. They take the same props as the styled parts, except `variant`, which only the styled layer has. The maximalist example on the landing page uses this approach. Its source is `src/demo/maximalist-demo.tsx` and `src/demo/maximalist.css`.

## Demo

The live demo is at [piemenu.jpmarqu.es](https://piemenu.jpmarqu.es). To run it on your machine:

```bash
git clone https://github.com/joaopmarques/pie-menu.git
```

```bash
cd pie-menu && pnpm install
```

```bash
pnpm dev
```

The landing page has a demo video, a life-sim room, a context menu, an icon-only menu, and a maximalist menu. In the life-sim room, each object opens a pie with the character's head at the center. The head follows the aim through the `--pie-aim-*` variables. See `src/demo/character.tsx` and `src/demo/demo.css`.

## Scripts

| Script | Action |
| --- | --- |
| `pnpm dev` | Start the demo. |
| `pnpm test` | Run the unit and interaction tests. |
| `pnpm typecheck` | Type-check the project. |
| `pnpm build` | Build the demo. |
| `pnpm registry:build` | Write the registry files to `public/r`. |

## Not yet supported

- Submenus (nested pies).
- Mark-ahead mode, where a fast flick selects before the menu shows.
