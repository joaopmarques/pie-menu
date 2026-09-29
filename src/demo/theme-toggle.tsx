import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"

import { setTheme, useTheme } from "./theme"

/** Shows the current theme. A click switches to the other one. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme()
  const next = theme === "dark" ? "light" : "dark"
  const Icon = theme === "dark" ? Moon : Sun
  const label = theme === "dark" ? "Dark" : "Light"

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      // The visible label comes first, so voice control users can say what they see.
      aria-label={`${label} mode. Switch to ${next} mode.`}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border bg-background px-3.5 text-sm font-medium outline-none",
        "hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </button>
  )
}
