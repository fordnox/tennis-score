import type { PlayerId } from '@/types'

/**
 * Keyboard bindings for scoring. One key per action so nothing is modal — the
 * pairs sit above each other on a QWERTY board (A over Z, K over M), which
 * makes "up is score, down is undo" hold physically as well as conceptually.
 */
export interface Shortcut {
  key: string
  /** How the key is shown to the user. */
  label: string
  player: PlayerId
  action: 'score' | 'undo'
}

export const SHORTCUTS: Shortcut[] = [
  { key: 'a', label: 'A', player: 0, action: 'score' },
  { key: 'z', label: 'Z', player: 0, action: 'undo' },
  { key: 'k', label: 'K', player: 1, action: 'score' },
  { key: 'm', label: 'M', player: 1, action: 'undo' },
]

export function findShortcut(key: string): Shortcut | undefined {
  const lower = key.toLowerCase()
  return SHORTCUTS.find((s) => s.key === lower)
}
