import { useState } from "react"
import { createRoot } from "react-dom/client"

import { PieMenu, PieMenuTrigger } from "@/components/ui/pie-menu"
import { ROOM_OBJECTS } from "@/demo/room-actions"
import { ActionPieContent, ObjectTile, Wallpaper } from "@/demo/room-demo"

import { Cursor, Toast } from "./scene-parts"

import "@/index.css"
import "@/demo/demo.css"

// The fridge from the life-sim room, with the same pie menu as the landing page.
const FRIDGE = ROOM_OBJECTS.find((object) => object.id === "fridge")!

function Recording() {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)

  return (
    <div className="fixed inset-0 overflow-hidden bg-card">
      <Wallpaper />

      <header className="absolute inset-x-0 top-14 space-y-1.5 text-center">
        <p className="text-4xl font-semibold tracking-tight">Pie Menu</p>
        <p className="text-base text-muted-foreground">
          A radial menu for React and shadcn/ui
        </p>
        <p className="font-mono text-sm text-muted-foreground">
          piemenu.jpmarqu.es
        </p>
      </header>

      <PieMenu>
        <PieMenuTrigger
          aria-label={FRIDGE.name}
          className="group absolute top-[57%] left-1/2 -translate-1/2 scale-150 rounded-2xl transition-opacity duration-200 outline-none data-[state=open]:opacity-0"
        >
          <ObjectTile icon={FRIDGE.icon} name={FRIDGE.name} />
        </PieMenuTrigger>
        <ActionPieContent
          actions={FRIDGE.actions}
          onChoose={(action) =>
            setToast((current) => ({
              id: (current?.id ?? 0) + 1,
              text: `Pip queued: ${action.label}`,
            }))
          }
        />
      </PieMenu>

      {toast && (
        <Toast key={toast.id} text={toast.text} onDone={() => setToast(null)} />
      )}
      <Cursor />
    </div>
  )
}

createRoot(document.getElementById("root")!).render(<Recording />)
