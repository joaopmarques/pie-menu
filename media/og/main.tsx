import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@/index.css"
import "@/demo/demo.css"

import { OgCard } from "./og-card"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OgCard />
  </StrictMode>,
)
