import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { PieMenu, PieMenuContent, PieMenuItem, PieMenuTrigger } from "./pie-menu"

// Four items, clockwise from the top: up, right, down, left.
function renderMenu(options: { openOn?: "press" | "contextmenu"; disabledRight?: boolean } = {}) {
  const onSelect = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <PieMenu onOpenChange={onOpenChange}>
      <PieMenuTrigger openOn={options.openOn}>Actions</PieMenuTrigger>
      <PieMenuContent radius={100} deadZone={20}>
        {["Up", "Right", "Down", "Left"].map((label) => (
          <PieMenuItem
            key={label}
            disabled={label === "Right" && options.disabledRight}
            onSelect={() => onSelect(label)}
          >
            {label}
          </PieMenuItem>
        ))}
      </PieMenuContent>
    </PieMenu>,
  )
  return { onSelect, onOpenChange, trigger: screen.getByRole("button", { name: "Actions" }) }
}

const pointer = (type: string, x: number, y: number, init: PointerEventInit = {}) =>
  new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: "mouse", ...init })

describe("PieMenu", () => {
  it("wires the trigger to the menu with ARIA", async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()
    expect(trigger).toHaveAttribute("aria-haspopup", "menu")
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    trigger.focus()
    await user.keyboard("{Enter}")

    const menu = screen.getByRole("menu")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(trigger).toHaveAttribute("aria-controls", menu.id)
    expect(menu).toHaveAccessibleName("Actions")
    expect(screen.getAllByRole("menuitem")).toHaveLength(4)
  })

  it("focuses the first item when it opens from the keyboard", async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()
    trigger.focus()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("menuitem", { name: "Up" })).toHaveFocus()
    expect(screen.getByRole("menuitem", { name: "Up" })).toHaveAttribute("data-highlighted")
  })

  it("picks items by direction with the arrow keys", async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()
    trigger.focus()
    await user.keyboard("{Enter}")

    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("menuitem", { name: "Right" })).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: "Down" })).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("menuitem", { name: "Left" })).toHaveFocus()
  })

  it("walks the ring with Tab and skips disabled items", async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu({ disabledRight: true })
    trigger.focus()
    await user.keyboard("{Enter}")

    await user.keyboard("{Tab}")
    expect(screen.getByRole("menuitem", { name: "Down" })).toHaveFocus()
    await user.keyboard("{Shift>}{Tab}{/Shift}")
    expect(screen.getByRole("menuitem", { name: "Up" })).toHaveFocus()
    expect(screen.getByRole("menuitem", { name: "Right" })).toHaveAttribute("aria-disabled", "true")
  })

  it("jumps to an item with typeahead", async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()
    trigger.focus()
    await user.keyboard("{Enter}")
    await user.keyboard("l")
    expect(screen.getByRole("menuitem", { name: "Left" })).toHaveFocus()
  })

  it("selects with Enter, closes, and returns focus to the trigger", async () => {
    const user = userEvent.setup()
    const { trigger, onSelect } = renderMenu()
    trigger.focus()
    await user.keyboard("{Enter}")
    await user.keyboard("{ArrowDown}{Enter}")

    expect(onSelect).toHaveBeenCalledWith("Down")
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("closes on Escape without a selection", async () => {
    const user = userEvent.setup()
    const { trigger, onSelect, onOpenChange } = renderMenu()
    trigger.focus()
    await user.keyboard("{Enter}")
    await user.keyboard("{Escape}")

    expect(onSelect).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("opens from the ContextMenu key and Shift+F10 in context-menu mode", async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu({ openOn: "contextmenu" })
    trigger.focus()

    await user.keyboard("{Enter}")
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()

    await user.keyboard("{Shift>}{F10}{/Shift}")
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })

  it("selects by direction on press, drag, and release", () => {
    const { trigger, onSelect } = renderMenu()

    act(() => void fireEvent(trigger, pointer("pointerdown", 200, 200, { button: 0 })))
    expect(screen.getByRole("menu")).toBeInTheDocument()

    act(() => void window.dispatchEvent(pointer("pointermove", 260, 205)))
    expect(screen.getByRole("menuitem", { name: "Right" })).toHaveAttribute("data-highlighted")

    act(() => void window.dispatchEvent(pointer("pointerup", 260, 205)))
    expect(onSelect).toHaveBeenCalledWith("Right")
  })

  it("selects on a fast flick with no move events", () => {
    const { trigger, onSelect } = renderMenu()
    act(() => void fireEvent(trigger, pointer("pointerdown", 200, 200, { button: 0 })))
    act(() => void window.dispatchEvent(pointer("pointerup", 200, 120)))
    expect(onSelect).toHaveBeenCalledWith("Up")
  })

  it("cancels when the drag returns to the center", () => {
    const { trigger, onSelect, onOpenChange } = renderMenu()
    act(() => void fireEvent(trigger, pointer("pointerdown", 200, 200, { button: 0 })))
    act(() => void window.dispatchEvent(pointer("pointermove", 260, 200)))
    act(() => void window.dispatchEvent(pointer("pointerup", 202, 201)))
    expect(onSelect).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("stays open after a click in the center, then selects on the next click", () => {
    const { trigger, onSelect } = renderMenu()
    act(() => void fireEvent(trigger, pointer("pointerdown", 200, 200, { button: 0 })))
    act(() => void window.dispatchEvent(pointer("pointerup", 201, 200)))
    expect(screen.getByRole("menu")).toBeInTheDocument()

    act(() => void window.dispatchEvent(pointer("pointerdown", 200, 300)))
    act(() => void window.dispatchEvent(pointer("pointerup", 200, 300)))
    expect(onSelect).toHaveBeenCalledWith("Down")
  })

  it("does not select a disabled wedge", () => {
    const { trigger, onSelect } = renderMenu({ disabledRight: true })
    act(() => void fireEvent(trigger, pointer("pointerdown", 200, 200, { button: 0 })))
    act(() => void window.dispatchEvent(pointer("pointermove", 300, 200)))
    expect(screen.getByRole("menuitem", { name: "Right" })).not.toHaveAttribute("data-highlighted")
    act(() => void window.dispatchEvent(pointer("pointerup", 300, 200)))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it("keeps the menu open when onSelect prevents the default", async () => {
    const user = userEvent.setup()
    render(
      <PieMenu>
        <PieMenuTrigger>Actions</PieMenuTrigger>
        <PieMenuContent>
          <PieMenuItem onSelect={(event) => event.preventDefault()}>Stay</PieMenuItem>
        </PieMenuContent>
      </PieMenu>,
    )
    screen.getByRole("button").focus()
    await user.keyboard("{Enter}")
    await user.keyboard("{Enter}")
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })
})
