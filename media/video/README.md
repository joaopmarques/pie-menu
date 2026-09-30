# Pie Menu demo video

This folder makes short demo videos of the pie menu for social media. Both videos show the real components.

| Scene | Output | Contents |
| --- | --- | --- |
| Clipboard | 1920 x 1080 (16:9), 120 fps and 60 fps | The same items as `ContextMenuDemo` in `src/demo/basic-demos.tsx`. |
| Life-sim | 1080 x 1350 (4:5), 60 fps | The fridge from the life-sim room, with the character's head at the center. 4:5 fills the most of the LinkedIn and Bluesky mobile feeds. |

## Files

| File | Contents |
| --- | --- |
| `recorder.mjs` | The shared engine: virtual time, frame capture, encoding, and motion helpers. |
| `scene-parts.tsx` | The shared page parts: the drawn cursor and the toast. |
| `video.css` | Styles for the cursor, the press ring, and the toast. |
| `index.html`, `main.tsx` | The clipboard scene page. |
| `record.mjs` | The clipboard choreography. |
| `life-sim.html`, `life-sim.tsx` | The life-sim scene page. It uses `ActionPieContent`, `ObjectTile`, and `Wallpaper` from `src/demo/room-demo.tsx`. |
| `record-life-sim.mjs` | The life-sim choreography. |

To add a scene, write a page that renders `Cursor` from `scene-parts.tsx`, and a script that calls `recordScene` with a `pointer(t)` and a `pressed(t)` function.

The script writes these files:

- `public/media/pie-menu-demo-120fps.mp4`: H.264, 1920 x 1080, 120 fps.
- `public/media/pie-menu-demo-60fps.mp4`: the same video at 60 fps. It keeps every second frame. It does not blend frames.
- `public/media/pie-menu-life-sim-1080x1350.mp4`: the life-sim scene, H.264, 1080 x 1350, 60 fps.

For the life-sim scene, run `pnpm media:video:life-sim` instead of `record.mjs`. The dev server step is the same.

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

## Make the README image

The GitHub README cannot play the MP4 files. It shows an animated WebP instead. After each new recording, run this command from the project root:

```bash
ffmpeg -y -i public/media/pie-menu-demo-60fps.mp4 -vf "scale=960:-2:flags=lanczos" -c:v libwebp_anim -lossless 0 -q:v 80 -compression_level 6 -loop 0 -an public/media/pie-menu-demo.webp
```

The result is about 340 KB, 960x540, 60 fps, and it loops forever.
