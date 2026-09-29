import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

import { copyText } from "./clipboard"

export function CodeBlock({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    // If the copy fails, the code stays selectable.
    if (await copyText(code)) setCopied(true)
  }

  return (
    <div className={cn("group relative", className)}>
      <pre className="overflow-x-auto rounded-lg border bg-muted/50 py-3 pr-12 pl-4 text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-2 right-2 grid size-8 place-items-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to the clipboard." : ""}
      </span>
    </div>
  )
}
