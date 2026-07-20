import { useCallback, useEffect, useRef, useState } from 'react'
import { loadHistory, remove, saveHistory, toRecord, upsert } from '@/lib/history'
import type { MatchRecord, MatchState } from '@/types'

/**
 * Archives a match the moment it is won, and un-archives it if that winning
 * point is undone.
 *
 * Deriving this from the live state rather than dispatching an "archive" action
 * means there is no way to finish a match without it being recorded — including
 * the match that was already finished when the app was last closed.
 */
export function useMatchHistory(state: MatchState) {
  const [records, setRecords] = useState<MatchRecord[]>(loadHistory)

  // Timestamps are taken once per match, not on every re-run of the effect
  // below, so re-mounting a finished match doesn't keep moving its finish time.
  const stampedAt = useRef<Record<string, string>>({})

  useEffect(() => {
    const { matchId, matchWinner } = state

    if (matchWinner === null) {
      setRecords((prev) => (prev.some((r) => r.id === matchId) ? remove(prev, matchId) : prev))
      return
    }

    stampedAt.current[matchId] ??= new Date().toISOString()
    const record = toRecord(state, matchWinner, stampedAt.current[matchId])

    setRecords((prev) => {
      const existing = prev.find((r) => r.id === matchId)
      // Bail out when nothing changed, or this would loop: setRecords -> render
      // -> effect -> setRecords.
      if (existing && JSON.stringify(existing) === JSON.stringify(record)) return prev
      return upsert(prev, record)
    })
  }, [state])

  useEffect(() => {
    saveHistory(records)
  }, [records])

  const clear = useCallback(() => setRecords([]), [])

  return { records, clear }
}
