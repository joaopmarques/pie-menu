# Open Graph image

This folder makes `public/og.png`. Social sites show this 1200x630 image when a person shares the site link.

The card is a small Vite page. It renders the real `PieMenu` component, open, with the demo character in the center.

## Files

| File | Contents |
| --- | --- |
| `index.html` | The page entry. |
| `main.tsx` | Mounts the card and loads the project styles. |
| `og-card.tsx` | The card layout: title, tagline, install command, and the open menu. |
| `render.mjs` | Captures the card with Playwright and writes `public/og.png`. |

## Make the image

1. Start the dev server from the project root:

   ```bash
   pnpm dev --port 5191 --strictPort
   ```

2. In a second terminal, run the render script from the project root:

   ```bash
   node media/og/render.mjs
   ```

3. Stop the dev server.

The script opens the card at 800x420 CSS px, moves the pointer toward the "Wave" item, and captures the page at 3x. Then ffmpeg scales the capture to 1200x630 with the lanczos filter.

## Options

- Set `OG_URL` to use a different page address.
- Set `FFMPEG` to use a different ffmpeg binary. The default is `/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg`.
- If Playwright cannot start Chromium, run `npx playwright install chromium`.
