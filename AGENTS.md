# AGENTS.md

Guidance for coding agents that work in this repository. Read it before you change code, docs, media, or the deploy.

## What this project is

Pie Menu is a radial menu component for React. It ships as a shadcn/ui registry item, so users copy the code into their own app with the shadcn CLI. The repository also holds the landing page at https://piemenu.jpmarqu.es.

- Author: João P. Marques (https://jpmarqu.es).
- Repository: https://github.com/joaopmarques/pie-menu (public). Its GitHub website field points to the landing page.
- Install command for users: `npx shadcn@latest add https://piemenu.jpmarqu.es/r/pie-menu.json`.
- The design follows the pie menus of Don Hopkins, Jack Callahan, and Mark Weiser (1986), and the marking menus of Gordon Kurtenbach and Bill Buxton.

## Requirements and stack

- React 19. The code uses `ref` as a prop, `use()`, and `<Context value>`. Do not add `forwardRef` or `.Provider`.
- Tailwind CSS v4. The styled layer uses v4 variants such as `data-highlighted:`, `not-data-selected:`, and `group-data-[...]/pie-menu:`.
- TypeScript 7, Vite 8, Vitest 5, pnpm.
- The only runtime dependency of the component is `radix-ui`, for `Slot`. Keep it that way.

## Commands

| Command | Action |
| --- | --- |
| `pnpm dev` | Start the landing page on http://localhost:5173. |
| `pnpm test` | Run the unit and interaction tests (30 tests). |
| `pnpm typecheck` | Type-check `src`. |
| `pnpm build` | Type-check and build the site into `dist`. |
| `pnpm registry:build` | Write the registry files to `public/r`. |
| `pnpm media:og` | Render `public/og.png`. The dev server must run first. |
| `pnpm media:video` | Record the demo videos into `public/media`. The dev server must run first. |

Before you finish any change, run `pnpm typecheck`, `pnpm test`, and `pnpm build`. The build writes `tsconfig.tsbuildinfo`. It is in `.gitignore`.

## File map

| Path | Contents |
| --- | --- |
| `src/lib/pie-menu/primitive.tsx` | The headless parts: `Root`, `Trigger`, `Content`, `Item`, `Center`, `Indicator`, and `usePieMenuAim`. It owns state, pointer and keyboard input, focus, ARIA, and viewport fit. |
| `src/lib/pie-menu/geometry.ts` | Pure math: angles, wedges, item layout, extents, fit scale, and shortest rotation. |
| `src/lib/pie-menu/aim.ts` | The aim store and the `--pie-aim-*` CSS variables. |
| `src/lib/pie-menu/use-presence.ts` | Mount and unmount timing for enter and exit transitions. |
| `src/lib/pie-menu/hooks.ts` | `useLatest`, `useControllableState`, `composeRefs`, and `composeHandlers`. |
| `src/components/ui/pie-menu.tsx` | The shadcn/ui styled layer. |
| `src/components/ui/pie-menu.test.tsx`, `src/lib/pie-menu/geometry.test.ts` | Tests. |
| `src/App.tsx` | The landing page layout. |
| `src/demo/` | Landing page parts: the room demo, the character head, the video section, the examples, the maximalist demo, the guide, the code block, and the theme toggle. |
| `media/og/` | The page and script that render the OG image. |
| `media/video/` | The page and script that record the demo videos. |
| `public/r/` | The built registry. It is committed, because Vercel serves it. |
| `public/llms.txt`, `public/llms-full.txt` | Summaries for LLM search, in the llmstxt.org format. |
| `public/favicon.svg` | The favicon: a pie emoji (🥧) in an SVG. |
| `LICENSE` | The MIT license. |
| `registry.json` | The registry manifest. |

## How the component works

### Two layers

- The primitive in `src/lib/pie-menu/` has no styles. It sets data attributes and CSS variables only.
- The styled layer in `src/components/ui/pie-menu.tsx` adds shadcn/ui tokens, `data-slot`, and Tailwind classes. It imports the primitive with `import * as PieMenuPrimitive from "@/lib/pie-menu/primitive"`.
- The maximalist demo (`src/demo/maximalist-demo.tsx`) uses the primitive directly with plain CSS. It shows that the primitive does not depend on the styled layer.

### Selection

- Items go clockwise from 12 o'clock, in DOM order. Items register in a layout effect and sort by document position.
- The menu picks an item by the angle of the pointer, not by the exact spot. Each wedge reaches the screen edge.
- A dead zone at the center selects nothing.
- A gesture has two modes:
  - `drag`: the press that opened the menu is still down. A release outside the dead zone selects. A release in the dead zone after a drag cancels.
  - `sticky`: after a click in place, or after a keyboard open. The next click selects, or cancels in the center.
- In `drag` mode, angles come from the press point. In `sticky` mode, angles come from the visual center.
- A release re-reads the pointer position, so a fast flick with no move event still selects.
- The dead zone never highlights. A pointer open highlights nothing until the pointer leaves the center. A keyboard open highlights the first item.
- Outside the dead zone, a pointer over an item element highlights that item, even when the menu was moved by the viewport fit.
- Do not let the item under the pointer win inside the dead zone. On open, all items start stacked at the center, right under the pointer, so the release would land on one of them and highlight it. A regression test covers this.
- `PieMenuItem` has `onHighlight`. The content calls it when the highlighted item changes to that item, from pointer or keyboard input.

### Live items

- Items can mount while the menu is open. The layout, the wedges, and the viewport fit re-flow at once, and the other items slide to their new places.
- Each item has its own `data-starting-style` for its first two frames, so a late item can transition in. The styled layer and `maximalist.css` style both the menu-level and the item-level start state.
- The highlight is stored by item id, so it stays on the same item when indices shift.
- An item removed while the menu is open unmounts with no exit transition. This is a known limit.

### Keyboard

- Arrow keys pick by direction. Two held arrows give a diagonal.
- Tab and Shift+Tab walk the ring. Home and End pick the first and last items. Letters run a typeahead.
- Enter and Space select. The code ignores `event.repeat`, so a held key from the trigger does not select at once.
- Escape closes. `onEscapeKeyDown` can call `preventDefault()` to keep the menu open.

### Focus

- A keyboard open focuses the first enabled item. A pointer open focuses the menu element.
- Every focus move goes through `focus(element, source)`. It passes `focusVisible: false` for pointer input, so mouse users do not see focus rings. Keyboard users do.
- On close, focus goes back to the trigger, unless something else took focus.

### Animation

- `usePresence` has four statuses: `starting` (one frame), `entering`, `open`, and `ending`. The content gets `data-starting-style`, `data-entering`, and `data-ending-style`.
- The hook waits for `getAnimations({ subtree: true })` to finish before it moves on or unmounts. It skips animations with an infinite end time. Without that filter, any looping animation inside the menu blocks the close forever.
- Use CSS transitions, not keyframes, for enter and exit, so a quick close reverses smoothly.
- The item stagger uses `data-entering`, so it does not delay highlight changes after the menu opens.
- Every animation must respect `prefers-reduced-motion`. The styled layer uses `motion-safe:` for movement, and the demos have their own reduced-motion rules.

### Pointer-driven styles

- The menu writes `--pie-aim-x`, `--pie-aim-y` (-1 to 1), `--pie-aim-angle`, and `--pie-aim-distance` (0 to 1) directly to the DOM. There is no React render per pointer move. Prefer these variables over `usePieMenuAim()` for visual effects.
- `--pie-item-translate` is the final `translate` for an item. Labels grow away from the center.
- The indicator gets `--pie-indicator-rotate`, and it always takes the shortest way around.

### Viewport fit

- The content measures the items and the first `[data-pie-menu-center]` before paint.
- If the menu is bigger than the viewport, it scales down, to 50% at the most. Then it moves away from the edges by `collisionPadding`.
- The viewport size falls back to `innerWidth` and `innerHeight` when `clientWidth` is 0, as in jsdom.

## Keep the docs in sync (required)

The component is documented in many places, for people, for search engines, and for LLMs. If you change what the component does, you must update every place in this list in the same change. That covers a new or renamed prop, part, hook, data attribute, CSS variable, key binding, interaction, requirement, or limit. A change is not done until this list is done.

| Place | What to update |
| --- | --- |
| `README.md` | The feature list, the parts and props tables, "Live items", "Interaction", "Styling hooks", "Headless use", and "Not yet supported". |
| `public/llms-full.txt` | The same sections as the README. Keep the two files in step. |
| `public/llms.txt` | The summary paragraph and the link descriptions. |
| `index.html` | The JSON-LD `SoftwareSourceCode` description and keywords, the `HowTo` steps, and the meta descriptions if the pitch changes. |
| `src/demo/guide.tsx` | The "How it works" steps and the tables in them. |
| `src/App.tsx` | The keyboard table, if a key binding changes. |
| `AGENTS.md` | This file, including "How the component works". |
| `public/r/` | Run `pnpm registry:build`, so installs get the new code. |
| `public/og.png`, `public/media/` | Render them again if the look of the component changes (`pnpm media:og`, `pnpm media:video`). Then make the README WebP again. |

Check the facts against the code, not against other docs. The prop names live in `src/lib/pie-menu/primitive.tsx` and `src/components/ui/pie-menu.tsx`. Parse the JSON-LD with `JSON.parse` after you edit it.

## The shadcn registry

- `registry.json` lists every component file. If you add, rename, or remove a file, update the list and run `pnpm registry:build`.
- Run `pnpm registry:build` after every change to a component file. Commit `public/r`.
- Do not add a barrel file such as `lib/pie-menu/index.ts`. The shadcn CLI rewrites imports by base name. An import of `@/lib/pie-menu` got rewritten to `@/components/ui/pie-menu`, which is the styled file itself. Keep the unique path `@/lib/pie-menu/primitive`.
- The current shadcn `utils` item installs the `cn` npm package in user apps. That is expected.
- To test an install, make an empty Vite app with a `components.json`, then run `npx shadcn@latest add <path>/public/r/pie-menu.json` and type-check it.

## The landing page

- The page order is fixed:
  1. The header: title, pitch, install command, jump links, and then the demo video. The video has no title, no description, and no download links. It keeps its pause button, because WCAG 2.2.2 needs a way to pause motion that lasts longer than 5 seconds.
  2. The life-sim room demo.
  3. The examples: context menu, icon only, and maximalist.
  4. The keyboard table.
  5. "How it works", always last.
- The video sets `muted` and `defaultMuted` in an effect before it calls `play()`. React does not write the `muted` attribute, and browsers only autoplay muted media. It does not autoplay with `prefers-reduced-motion`.
- The maximalist demo uses 112px stickers on a ring with a radius of 176px. The disc size comes from `--pie-radius` in `maximalist.css`.
- Keep the easter egg out of the public docs (README and llms files). It is a secret for visitors.
- The maximalist demo has an easter egg. Move between Taco and Sushi three times, and "Antidepressant" appears between them while the menu is open. Its selection shows "The world needs more joy. Keep being awesome! ❤️". The demo counts switches with `onHighlight`. A different item resets the count. The same item again does not. A screen reader announcement tells users that a secret item appeared.
- The header and the footer each have a GitHub link (`src/demo/github-link.tsx`), then the theme toggle.
- The theme toggle is in the header and the footer.
  - It shows the current mode and switches to the other one.
  - It follows the system until the user clicks. A click that matches the system clears the stored choice.
  - The storage key is `pie-menu-theme`. The inline script in `index.html` and `src/demo/theme.ts` must use the same key.
  - The inline script only sets the first paint. `theme.ts` handles all changes.
- SEO and LLM search:
  - `index.html` has the meta, Open Graph, and Twitter tags, and a JSON-LD `@graph` with `WebSite`, `SoftwareSourceCode`, `HowTo`, and `VideoObject`.
  - `public/llms.txt` and `public/llms-full.txt` describe the component.
  - When a URL, a prop, or a requirement changes, follow "Keep the docs in sync".
- All absolute URLs use `https://piemenu.jpmarqu.es`. Search for the old domain before you add a new URL.

## Media

- `public/og.png` is 1200x630. It renders from real code in `media/og/`. Render it again when the domain, the tagline, or the component look changes. The script accepts `OG_URL`.
- The GitHub README shows `public/media/pie-menu-demo.webp`, an animated WebP made from the 60 fps video. GitHub only plays `<video>` for files uploaded through its web editor, so the README uses an image. Make it again after every new recording, with the command in `media/video/README.md`.
- The videos in `public/media/` are 1920x1080 at 120 fps and 60 fps, 8 seconds long, and they loop. The 60 fps copy is for X and LinkedIn, which cap playback at 60 fps. The poster is `public/media/pie-menu-demo-poster.jpg`.
- The recorder uses a virtual clock:
  - It replaces the timers and `requestAnimationFrame`, and it seeks every Web Animation to the virtual time.
  - Each frame advances exactly 1000/120 ms, so the 120 fps is real.
  - Chrome's `HeadlessExperimental.beginFrame` does not work on macOS.
  - The script accepts `--url`, `--frames`, `--out`, and `--keep-frames`.
- `media/og` uses port 5191 by default and `media/video` uses port 5190. Start `pnpm dev --port <port> --strictPort` first.

## Deploy

- The site deploys to Vercel under the personal scope `jpmarques` ("João's projects"). Do not use the Pixelmatters team scope.
- Command: `vercel deploy --prod --yes --scope jpmarques`.
- Vercel detects Vite, and `dist` includes `public/r`, the llms files, the OG image, and the media.
- The Vercel project is connected to GitHub. A push to `main` deploys to production, so you do not need to run `vercel deploy` after a push.
- The domain `piemenu.jpmarqu.es` is attached to the project and is the canonical URL. Do not change DNS or domain settings unless the owner asks.

## Tests and browser checks

- Vitest runs in jsdom. `src/test/setup.ts` adds a `PointerEvent` polyfill.
- Pointer tests dispatch events on `window`, because the content listens there in the capture phase.
- In the desktop app's browser pane:
  - A hidden pane throttles `requestAnimationFrame` to about 1 frame per second. Animations then look stuck, and screenshots lag. Measure the rAF gaps before you blame the code.
  - Color-scheme emulation changes the media query but fires no `change` event. Reload to test the system theme.

## Rules

- Do not use "The Sims" branding: no "Sims" or "Sim" wording and no green diamond (plumbob). EA owns them. Use "life-sim room", "the character", and the thought bubble.
- The license is MIT, in `LICENSE` (Copyright (c) 2026 João P. Marques). The README, both llms files, `package.json`, and the JSON-LD state it. Keep them in step if the license ever changes.
- Do not commit, push, or deploy unless the owner asks for it.
- Write all prose in ASD-STE100 Simplified Technical English: short sentences, active voice, no contractions, no semicolons, and no marketing adjectives. This covers docs, code comments, commit messages, and page text.
- Match the surrounding code: its naming, its comment density, and its idioms.

## Not supported yet

- Submenus (nested pies).
- Mark-ahead mode, where a fast flick selects before the menu shows.
- React 18 and Tailwind CSS v3.
