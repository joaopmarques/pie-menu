import { useSyncExternalStore } from "react"

/**
 * The site theme. It follows the system until the user picks a theme. A pick
 * that matches the system clears the stored choice, so the page follows the
 * system again. index.html applies the first theme before paint.
 */
export type Theme = "light" | "dark"

const STORAGE_KEY = "pie-menu-theme"
const media = window.matchMedia("(prefers-color-scheme: dark)")
const listeners = new Set<() => void>()
let stored = readStored()

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === "light" || value === "dark" ? value : null
  } catch {
    return null
  }
}

function writeStored(theme: Theme | null) {
  try {
    if (theme) localStorage.setItem(STORAGE_KEY, theme)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be blocked. The theme still changes for this visit.
  }
}

function systemTheme(): Theme {
  return media.matches ? "dark" : "light"
}

export function getTheme(): Theme {
  return stored ?? systemTheme()
}

function apply() {
  const theme = getTheme()
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
  listeners.forEach((listener) => listener())
}

export function setTheme(theme: Theme) {
  stored = theme === systemTheme() ? null : theme
  writeStored(stored)
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
  // A cross-fade between themes, where the browser supports it.
  if (!reduceMotion && document.startViewTransition)
    document.startViewTransition(apply)
  else apply()
}

media.addEventListener("change", apply)

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => "light" as Theme)
}
