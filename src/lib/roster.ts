import { MAX_NAME_LENGTH, PLAYER_ROSTER_KEY, ROSTER_LIMIT } from '@/types'

/**
 * Recently used player names, most recent first — the pool the settings screen
 * offers as one-tap chips when pairs rotate between games.
 *
 * Kept in its own localStorage key and guarded like the other stores:
 * persistence failing must never break the app.
 */

/** Folds names into a roster: newest first, case-insensitive dedupe, capped. */
export function mergeRoster(roster: string[], names: string[]): string[] {
  const next: string[] = []
  const seen = new Set<string>()
  for (const raw of [...names, ...roster]) {
    const name = raw.trim().slice(0, MAX_NAME_LENGTH)
    const key = name.toLowerCase()
    if (!name || seen.has(key)) continue
    seen.add(key)
    next.push(name)
    if (next.length === ROSTER_LIMIT) break
  }
  return next
}

export function loadRoster(): string[] {
  try {
    const raw = localStorage.getItem(PLAYER_ROSTER_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return mergeRoster(
      [],
      parsed.filter((n): n is string => typeof n === 'string'),
    )
  } catch {
    return []
  }
}

/** Folds names into the stored roster and returns the result. */
export function rememberNames(names: string[]): string[] {
  const merged = mergeRoster(loadRoster(), names)
  try {
    localStorage.setItem(PLAYER_ROSTER_KEY, JSON.stringify(merged))
  } catch {
    // Full or unavailable — the roster simply stops growing.
  }
  return merged
}
