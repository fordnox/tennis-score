import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

/** Total movement still counted as a tap rather than a drag. */
const TAP_SLOP = 12
/** Longer presses are treated as hesitation, not a score. */
const TAP_MAX_MS = 600
/** Downward travel required to read as a deliberate swipe. */
const SWIPE_MIN_DY = 60
/** Vertical travel must dominate horizontal by this factor. */
const SWIPE_RATIO = 1.5

interface Options {
  onTap: () => void
  onSwipeDown: () => void
  disabled?: boolean
}

interface Pending {
  id: number
  x: number
  y: number
  t: number
}

/**
 * Distinguishes "tap to score" from "swipe down to take a point back" on one
 * element, using pointer events so touch, mouse and pen share a code path.
 *
 * Deliberately no onClick: pointer events already cover mouse, and adding a
 * click handler on top would double-fire via the synthesized click on touch.
 */
export function useScoreGestures({ onTap, onSwipeDown, disabled }: Options) {
  const pending = useRef<Pending | null>(null)

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (disabled) return
    // Ignore extra fingers so a two-handed grab can't score twice.
    if (pending.current !== null) return

    pending.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp }
    // Capture guarantees the matching pointerup even if the finger slides off.
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    const start = pending.current
    pending.current = null
    if (disabled || start === null || start.id !== e.pointerId) return

    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const dt = e.timeStamp - start.t

    if (dy > SWIPE_MIN_DY && dy > Math.abs(dx) * SWIPE_RATIO) {
      onSwipeDown()
      return
    }

    if (Math.hypot(dx, dy) < TAP_SLOP && dt < TAP_MAX_MS) {
      onTap()
      return
    }

    // Anything else is ambiguous — better to do nothing than guess wrong.
  }

  const onPointerCancel = (e: ReactPointerEvent<HTMLElement>) => {
    if (pending.current?.id === e.pointerId) pending.current = null
  }

  return { onPointerDown, onPointerUp, onPointerCancel }
}
