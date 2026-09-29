import {
  Bed,
  BedDouble,
  BookMarked,
  BookOpen,
  Briefcase,
  Brush,
  Clapperboard,
  Cookie,
  CookingPot,
  CupSoda,
  Eye,
  Feather,
  Gamepad2,
  Globe,
  Guitar,
  Hand,
  Heart,
  LibraryBig,
  Laugh,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  Music,
  PartyPopper,
  Power,
  Refrigerator,
  ShoppingCart,
  Sparkles,
  Tv,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react"

export interface RoomAction {
  label: string
  icon: LucideIcon
  disabled?: boolean
}

export interface RoomObject {
  id: string
  name: string
  icon: LucideIcon
  /** Position in the room, in percent. */
  x: number
  y: number
  actions: RoomAction[]
}

export const ROOM_OBJECTS: RoomObject[] = [
  {
    id: "fridge",
    name: "Fridge",
    icon: Refrigerator,
    x: 9,
    y: 34,
    actions: [
      { label: "Have Snack", icon: Cookie },
      { label: "Cook Dinner", icon: CookingPot },
      { label: "Grab a Soda", icon: CupSoda },
      { label: "Clean", icon: Sparkles },
    ],
  },
  {
    id: "bookshelf",
    name: "Bookshelf",
    icon: LibraryBig,
    x: 27,
    y: 30,
    actions: [
      { label: "Read Novel", icon: BookOpen },
      { label: "Study Cooking", icon: BookMarked },
      { label: "Study Mechanics", icon: Wrench },
      { label: "Write Poem", icon: Feather },
      { label: "Dust", icon: Brush },
    ],
  },
  {
    id: "tv",
    name: "Television",
    icon: Tv,
    x: 50,
    y: 30,
    actions: [
      { label: "Watch Comedy", icon: Laugh },
      { label: "Watch Romance", icon: Heart },
      { label: "Watch Action", icon: Clapperboard },
      { label: "Turn Off", icon: Power },
    ],
  },
  {
    id: "computer",
    name: "Computer",
    icon: Monitor,
    x: 72,
    y: 32,
    actions: [
      { label: "Find a Job", icon: Briefcase },
      { label: "Play Games", icon: Gamepad2 },
      { label: "Chat", icon: MessageCircle },
      { label: "Buy Groceries", icon: ShoppingCart },
      { label: "Browse Web", icon: Globe },
      { label: "Upgrade (Handy 3)", icon: Wrench, disabled: true },
    ],
  },
  {
    id: "guitar",
    name: "Guitar",
    icon: Guitar,
    x: 90,
    y: 60,
    actions: [
      { label: "Play", icon: Music },
      { label: "Practice", icon: Zap },
      { label: "Sing Along", icon: Mic },
    ],
  },
  {
    id: "bed",
    name: "Bed",
    icon: BedDouble,
    x: 74,
    y: 76,
    actions: [
      { label: "Sleep", icon: Moon },
      { label: "Nap", icon: Bed },
      { label: "Make Bed", icon: Sparkles },
      { label: "Relax", icon: Heart },
    ],
  },
]

export const SELF_ACTIONS: RoomAction[] = [
  { label: "Dance", icon: PartyPopper },
  { label: "Hum a Tune", icon: Music },
  { label: "Check Self", icon: Eye },
  { label: "Stretch", icon: Zap },
  { label: "Wave", icon: Hand },
  { label: "Tell a Joke", icon: Laugh },
  { label: "Daydream", icon: Sparkles },
  { label: "Nap on Floor", icon: Moon },
]
