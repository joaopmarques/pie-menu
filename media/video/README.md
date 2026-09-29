# Pie Menu demo video

This folder makes a short demo video of the pie menu for social media. The video shows the real component with the same items as `ContextMenuDemo` in `src/demo/basic-demos.tsx`.

## Files

| File | Contents |
| --- | --- |
| `index.html` | The recording page. |
| `main.tsx` | The page entry. It renders the menu, a drawn cursor, and a toast. |
| `video.css` | Styles for the cursor, the press ring, and the toast. |
| `record.mjs` | The capture script. It writes the frames and encodes the videos. |

The script writes these files:

- `public/media/pie-menu-demo-120fps.mp4`: H.264, 1920 x 1080, 120 fps.
- `public/media/pie-menu-demo-60fps.mp4`: the same video at 60 fps. It keeps every second frame. It does not blend frames.

## Record the video

1. Start the dev server from the project root:

   ```bash
   pnpm dev --port 5190 --strictPort
   ```

2. In a second terminal, run the capture script from the project root:

   ```bash
   node media/video/record.mjs
   ```

3. Stop the dev server.

The script takes about 1.5 minutes. It deletes the PNG frames when it finishes.

## Options

| Option | Default | Use |
| --- | --- | --- |
| `--url URL` | `http://localhost:5190/media/video/index.html` | The page to record. |
| `--frames DIR` | A new folder in the system temp folder | The folder for the PNG frames. |
| `--out DIR` | `public/media` | The folder for the videos. |
| `--keep-frames` | Off | Keep the PNG frames after the encode. |
| `--ffmpeg PATH` | `/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg` | The ffmpeg binary. |

## How the capture works

Chrome on macOS does not support begin-frame control (`HeadlessExperimental.beginFrame`). Thus the script uses virtual time:

1. An init script replaces `performance.now`, `Date`, `requestAnimationFrame`, and the timers with a virtual clock.
2. For each frame, the script sends the mouse input through Playwright. The component gets real pointer events.
3. The script moves the virtual clock forward by exactly 1000/120 ms and runs the due callbacks.
4. The script pauses each CSS transition and CSS animation and seeks it to the virtual time. When an animation reaches its end, the script calls `finish()`. This resolves the `finished` promise that `use-presence.ts` waits for.
5. The script takes a screenshot at device scale. The viewport is 720 x 405 CSS px at a scale of 8/3, so each frame is 1920 x 1080 px.

Each frame shows a new moment in time. Frames repeat only while nothing moves on screen.

## Change the motion

Edit the `T` object and the `pointer()` function in `record.mjs`. `T` holds the times in seconds. `pointer()` returns the cursor position for a time. Keep the first and the last frame the same, so the video loops.
