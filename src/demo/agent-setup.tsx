import { Bot } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { copyText } from "./clipboard"

/** A prompt for a coding agent (Claude Code, Cursor, and others) that adds Pie Menu to a project. */
export const AGENT_SETUP_PROMPT = `Set up the Pie Menu component in this project.

Pie Menu is a radial menu for React, shipped as a shadcn/ui registry item. Docs: https://piemenu.jpmarqu.es/llms-full.txt

1. Check the requirements. The project must use React 19, Tailwind CSS v4, and shadcn/ui (a components.json file). If one is missing, stop and tell me what to change.
2. Install it: npx shadcn@latest add https://piemenu.jpmarqu.es/r/pie-menu.json
3. Read the docs above before you write code. Use only the parts and props that they list.
4. Find one place in the app where a pie menu helps, such as a context menu or a group of related actions. If no place is clear, ask me.
5. Add a menu there with PieMenu, PieMenuTrigger, PieMenuContent, PieMenuItem, and PieMenuIndicator. Use the icons and actions that the app already has.
6. Keep it accessible. Give icon-only items an aria-label and a textValue. If the trigger is not a button, give it tabIndex={0}.
7. Run the type check, the linter, and the tests. Fix any errors.
8. Tell me which files you added or changed, and how to try the menu.`

export function AgentSetupButton({ className }: { className?: string }) {
  const copy = async () => {
    if (!(await copyText(AGENT_SETUP_PROMPT))) {
      toast.error("Could not copy the prompt", {
        description: "The browser blocked the clipboard. Try again, or allow clipboard access for this site.",
      })
      return
    }
    toast.success("Setup prompt copied!", {
      description: "Paste it in your agent to setup Pie Menu automatically.",
    })
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium outline-none",
        // emerald-400 is light, so the text is emerald-950 (7.8:1). White text would be 1.9:1.
        "bg-emerald-400 text-emerald-950 shadow-xs hover:bg-emerald-300 active:bg-emerald-500",
        "focus-visible:ring-[3px] focus-visible:ring-emerald-400/50",
        className,
      )}
    >
      <Bot className="size-4" aria-hidden />
      Copy prompt for agent setup
    </button>
  )
}
