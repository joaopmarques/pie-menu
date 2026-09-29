import { cn } from "@/lib/utils"

export interface CharacterLook {
  skin: string
  skinShade: string
  hair: string
  shirt: string
}

export const PIP: CharacterLook = {
  skin: "#f2c7a5",
  skinShade: "#e3ad88",
  hair: "#5b3a29",
  shirt: "#3b82f6",
}

/**
 * A cartoon head that looks where the user aims. It reads the `--pie-aim-x`
 * and `--pie-aim-y` CSS variables, so it follows the pointer with no React renders.
 * Outside a pie menu, any ancestor can set the same variables.
 */
export function CharacterHead({
  look = PIP,
  className,
}: {
  look?: CharacterLook
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("character-head overflow-visible", className)}
      aria-hidden
    >
      <g className="character-head__skull">
        <path
          d="M17 58 C13 24 34 9 51 9 C71 9 89 25 84 58 L80 74 L21 74 Z"
          fill={look.hair}
        />
        <ellipse cx="17.5" cy="58" rx="6" ry="8.5" fill={look.skinShade} />
        <ellipse cx="82.5" cy="58" rx="6" ry="8.5" fill={look.skinShade} />
        <ellipse cx="50" cy="56" rx="32" ry="36" fill={look.skin} />

        <g className="character-head__face">
          <g
            className="character-head__brows"
            stroke={look.hair}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          >
            <path d="M31 43 Q37.5 39.5 44 42" />
            <path d="M56 42 Q62.5 39.5 69 43" />
          </g>

          <ellipse cx="37.5" cy="53" rx="5.6" ry="6.6" fill="#fff" />
          <ellipse cx="62.5" cy="53" rx="5.6" ry="6.6" fill="#fff" />
          <g className="character-head__pupils" fill="#2a2320">
            <circle cx="37.5" cy="53.5" r="3.1" />
            <circle cx="62.5" cy="53.5" r="3.1" />
            <circle cx="38.6" cy="52.2" r="1" fill="#fff" />
            <circle cx="63.6" cy="52.2" r="1" fill="#fff" />
          </g>
          <g className="character-head__lids" fill={look.skin}>
            <rect x="31" y="46" width="13" height="14" rx="6" />
            <rect x="56" y="46" width="13" height="14" rx="6" />
          </g>

          <path
            d="M50 58 Q47.5 64 50.5 65.5"
            stroke={look.skinShade}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="30" cy="66" r="5" fill="#f08a8a" opacity="0.28" />
          <circle cx="70" cy="66" r="5" fill="#f08a8a" opacity="0.28" />

          <path
            className="character-head__smile"
            d="M42 73 Q50 78 58 73"
            stroke="#9a4a3c"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="character-head__smile-wide"
            d="M40 71.5 Q50 82 60 71.5 Q50 75.5 40 71.5 Z"
            fill="#9a4a3c"
          />
        </g>

        <path
          className="character-head__fringe"
          d="M19 47 C22 22 42 14 57 16 C71 18 82 29 83 46 C75 36 64 31 54 34 C46 29 30 33 19 47 Z"
          fill={look.hair}
        />
      </g>
    </svg>
  )
}

/** A floating thought bubble. The dots pulse while the character thinks. Pure decoration. */
export function ThoughtBubble({ className }: { className?: string }) {
  return (
    <div
      className={cn("thought-bubble pointer-events-none", className)}
      aria-hidden
    >
      <svg
        viewBox="0 0 44 34"
        className="h-full w-auto overflow-visible drop-shadow-sm"
      >
        <circle cx="12" cy="31" r="2" className="fill-card stroke-border" />
        <circle cx="16" cy="25.5" r="3" className="fill-card stroke-border" />
        <rect
          x="6"
          y="1"
          width="36"
          height="20"
          rx="10"
          className="fill-card stroke-border"
        />
        <g className="fill-muted-foreground">
          <circle className="thought-bubble__dot" cx="16" cy="11" r="2.2" />
          <circle className="thought-bubble__dot" cx="24" cy="11" r="2.2" />
          <circle className="thought-bubble__dot" cx="32" cy="11" r="2.2" />
        </g>
      </svg>
    </div>
  )
}

/** The head in a round badge, sized for the center of a pie menu. */
export function CharacterAvatar({ look = PIP }: { look?: CharacterLook }) {
  return (
    <div className="relative">
      <ThoughtBubble className="absolute -top-8 left-[62%] h-8" />
      <div className="grid size-24 place-items-center rounded-full border bg-popover/90 shadow-xl backdrop-blur-sm">
        <CharacterHead look={look} className="size-20" />
      </div>
    </div>
  )
}
