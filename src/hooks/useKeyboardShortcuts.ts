import { useEffect } from 'react'
import { findShortcut } from '@/lib/shortcuts'
import type { Action } from '@/types'

/** Layers that own the keyboard while they are open. */
const OVERLAY = [
  '[data-slot="dialog-content"]',
  '[data-slot="alert-dialog-content"]',
  '[data-slot="dropdown-menu-content"]',
].join(',')

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  )
}

/**
 * Scores and undoes from the keyboard, for when the app is driven from a laptop
 * beside the table rather than by thumb.
 *
 * @param scoringEnabled false once the match is won — mirrors the panels, which
 *   stop taking points but still allow the winning point to be taken back.
 */
export function useKeyboardShortcuts(dispatch: React.Dispatch<Action>, scoringEnabled: boolean) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Held keys would rattle the score up at the OS repeat rate.
      if (e.repeat) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isTyping(e.target)) return
      if (document.querySelector(OVERLAY)) return

      const shortcut = findShortcut(e.key)
      if (!shortcut) return
      if (shortcut.action === 'score' && !scoringEnabled) return

      e.preventDefault()
      dispatch(
        shortcut.action === 'score'
          ? { type: 'POINT', player: shortcut.player }
          : { type: 'UNDO_FOR', player: shortcut.player },
      )
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, scoringEnabled])
}
