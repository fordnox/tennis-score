import {
  MATCH_HISTORY_KEY,
  MATCH_HISTORY_LIMIT,
  type MatchRecord,
  type MatchState,
  type PlayerId,
} from '@/types'

/**
 * The archive of finished matches. Kept in its own localStorage key so a
 * corrupt live match can never take the history down with it, and vice versa.
 *
 * As with the live state, every access is guarded — persistence failing is not
 * a reason for the app to stop working.
 */

const isPair = (v: unknown): v is [number, number] =>
  Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number')

function isRecord(v: unknown): v is MatchRecord {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Partial<MatchRecord>
  return (
    typeof r.id === 'string' &&
    typeof r.finishedAt === 'string' &&
    Array.isArray(r.names) &&
    r.names.length === 2 &&
    isPair(r.games) &&
    Array.isArray(r.completed) &&
    (r.winner === 0 || r.winner === 1)
  )
}

export function loadHistory(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(MATCH_HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isRecord) : []
  } catch {
    return []
  }
}

export function saveHistory(records: MatchRecord[]): void {
  try {
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(records))
  } catch {
    // Full or unavailable — the archive simply stops growing.
  }
}

export function toRecord(state: MatchState, winner: PlayerId, finishedAt: string): MatchRecord {
  return {
    id: state.matchId,
    finishedAt,
    names: state.names,
    target: state.target,
    bestOf: state.bestOf,
    games: state.games,
    completed: state.completed,
    winner,
  }
}

/**
 * Newest first, one entry per matchId. Replacing by id rather than appending is
 * what makes archiving idempotent — the effect that writes here re-runs on
 * every mount and on every render where the match is already finished.
 */
export function upsert(records: MatchRecord[], record: MatchRecord): MatchRecord[] {
  const without = records.filter((r) => r.id !== record.id)
  return [record, ...without].slice(0, MATCH_HISTORY_LIMIT)
}

/** Used when a match win is undone — the match is live again, so un-archive it. */
export function remove(records: MatchRecord[], id: string): MatchRecord[] {
  return records.filter((r) => r.id !== id)
}
