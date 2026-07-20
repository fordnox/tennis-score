import { newId } from './id'
import { initialStore } from './match'
import { STATE_VERSION, STORAGE_KEY, type MatchState, type Store } from '@/types'

/**
 * Every access is guarded: localStorage throws in Safari private mode and when
 * the quota is exceeded. The app must keep working with persistence dead, so
 * failures here are swallowed rather than surfaced.
 */

const isPair = (v: unknown): v is [number, number] =>
  Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number' && n >= 0)

/**
 * v1 predates the match archive and so has no matchId. Minting one keeps an
 * in-progress match alive across the upgrade instead of discarding it.
 */
function migrate(v: unknown): unknown {
  if (typeof v !== 'object' || v === null) return v
  const s = v as Record<string, unknown>
  if (s.version === 1) return { ...s, version: STATE_VERSION, matchId: newId() }
  return v
}

function isMatchState(v: unknown): v is MatchState {
  if (typeof v !== 'object' || v === null) return false
  const s = v as Partial<MatchState>
  return (
    s.version === STATE_VERSION &&
    typeof s.matchId === 'string' &&
    Array.isArray(s.names) &&
    s.names.length === 2 &&
    (s.target === 11 || s.target === 21) &&
    (s.bestOf === 3 || s.bestOf === 5 || s.bestOf === 7) &&
    isPair(s.points) &&
    isPair(s.games) &&
    (s.server === 0 || s.server === 1) &&
    Array.isArray(s.completed) &&
    (s.matchWinner === null || s.matchWinner === 0 || s.matchWinner === 1)
  )
}

export function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialStore()

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return initialStore()

    const { state, history } = parsed as Partial<Store>
    const migrated = migrate(state)
    if (!isMatchState(migrated)) return initialStore()

    return {
      state: migrated,
      history: Array.isArray(history) ? history.map(migrate).filter(isMatchState) : [],
    }
  } catch {
    // Corrupt JSON, unreadable storage, or a schema we no longer understand.
    return initialStore()
  }
}

export function save(store: Store): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Full or unavailable — the in-memory match carries on regardless.
  }
}
