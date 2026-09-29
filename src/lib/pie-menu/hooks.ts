import { useCallback, useLayoutEffect, useRef, useState, type Ref } from "react"

export function useLatest<T>(value: T) {
  const ref = useRef(value)
  useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}

export function useControllableState<T>(options: {
  value: T | undefined
  defaultValue: T
  onChange?: (value: T) => void
}) {
  const [uncontrolled, setUncontrolled] = useState(options.defaultValue)
  const isControlled = options.value !== undefined
  const value = isControlled ? (options.value as T) : uncontrolled
  const onChange = useLatest(options.onChange)

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next)
      if (!Object.is(next, value)) onChange.current?.(next)
    },
    [isControlled, value, onChange],
  )

  return [value, setValue] as const
}

export function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === "function") return ref(node)
      if (ref) ref.current = node
      return undefined
    })
    return () => {
      cleanups.forEach((cleanup, index) => {
        const ref = refs[index]
        if (typeof cleanup === "function") cleanup()
        else if (typeof ref === "function") ref(null)
        else if (ref) ref.current = null
      })
    }
  }
}

/** Calls the user handler first. The internal handler runs unless the user prevented it. */
export function composeHandlers<E extends { defaultPrevented: boolean }>(
  userHandler: ((event: E) => void) | undefined,
  ownHandler: (event: E) => void,
) {
  return (event: E) => {
    userHandler?.(event)
    if (!event.defaultPrevented) ownHandler(event)
  }
}
