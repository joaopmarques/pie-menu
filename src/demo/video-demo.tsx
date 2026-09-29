import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"

/** The recorded demo. It plays on a loop, except for users who ask for reduced motion. */
export function VideoDemo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    // React does not write the `muted` attribute, and browsers only autoplay muted media.
    video.muted = true
    video.defaultMuted = true
    const start = () => {
      video.play().catch(() => {
        // Autoplay can be blocked. The play button still works.
      })
    }
    start()
    video.addEventListener("canplay", start, { once: true })
    return () => video.removeEventListener("canplay", start)
  }, [])

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-white shadow-sm">
      <video
        ref={videoRef}
        className="aspect-video w-full"
        src="/media/pie-menu-demo-120fps.mp4"
        poster="/media/pie-menu-demo-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Demo: the cursor opens a pie menu with Copy, Cut, Paste, Duplicate, Share, and Delete. It sweeps across the items, then picks Copy."
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause the video" : "Play the video"}
        className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full border border-neutral-200 bg-white/90 text-neutral-900 shadow-md backdrop-blur-sm outline-none hover:bg-white focus-visible:ring-[3px] focus-visible:ring-neutral-400"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
    </div>
  )
}
