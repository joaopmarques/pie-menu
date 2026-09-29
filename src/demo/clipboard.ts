/**
 * Copies text to the clipboard. It uses the Clipboard API first. Some frames
 * and browser settings block that API, so it falls back to a hidden text area.
 * Returns true when the text was copied.
 */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return copyWithTextArea(text)
  }
}

function copyWithTextArea(text: string) {
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const area = document.createElement("textarea")
  area.value = text
  area.setAttribute("readonly", "")
  area.style.position = "fixed"
  area.style.opacity = "0"
  document.body.append(area)
  area.select()
  let copied = false
  try {
    copied = document.execCommand("copy")
  } catch {
    copied = false
  }
  area.remove()
  active?.focus({ preventScroll: true })
  return copied
}
