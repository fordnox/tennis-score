export type PlayerId = 0 | 1
export type Pair<T> = [T, T]

export type Target = 11 | 21
export type BestOf = 1 | 3 | 5 | 7

export const TARGETS: Target[] = [11, 21]
export const BEST_OF: BestOf[] = [1, 3, 5, 7]

export const STORAGE_KEY = 'tt-scoreboard-v1'
export const MATCH_HISTORY_KEY = 'tt-scoreboard-history-v1'
export const STATE_VERSION = 2
/** Depth of the swipe-down undo stack for the match in progress. */
export const UNDO_LIMIT = 20
/** How many finished matches to keep before dropping the oldest. */
export const MATCH_HISTORY_LIMIT = 50
export const MAX_NAME_LENGTH = 14

/**
 * Describes the most recent state-changing action, so a swipe-down can tell
 * "undo the point I just scored" from "nudge this score down by one".
 */
export type LastAction = { type: 'point'; player: PlayerId } | { type: 'other' } | null

export interface MatchState {
  version: typeof STATE_VERSION
  /** Identifies this match in the archive, so completing and un-completing it
   *  updates one record rather than piling up duplicates. */
  matchId: string
  names: Pair<string>
  target: Target
  bestOf: BestOf
  /** Points in the game currently being played. */
  points: Pair<number>
  /** Games won so far this match. */
  games: Pair<number>
  /** Who is serving. Manual only — nothing rotates this automatically. */
  server: PlayerId
  /** Final scores of games already finished. */
  completed: Pair<number>[]
  matchWinner: PlayerId | null
  lastAction: LastAction
}

export interface Store {
  state: MatchState
  /** Undo stack of prior states, newest last, capped at UNDO_LIMIT. */
  history: MatchState[]
}

/** A finished match, kept in the archive. Only completed matches are recorded. */
export interface MatchRecord {
  id: string
  /** ISO timestamp of the winning point. */
  finishedAt: string
  names: Pair<string>
  target: Target
  bestOf: BestOf
  games: Pair<number>
  /** Final score of each game, in order played. */
  completed: Pair<number>[]
  winner: PlayerId
}

export type Action =
  | { type: 'POINT'; player: PlayerId }
  | { type: 'UNDO_FOR'; player: PlayerId }
  | { type: 'SET_NAME'; player: PlayerId; value: string }
  | { type: 'SET_TARGET'; value: Target }
  | { type: 'SET_BEST_OF'; value: BestOf }
  | { type: 'TOGGLE_SERVER' }
  | { type: 'SET_SERVER'; player: PlayerId }
  | { type: 'RESET_GAME' }
  | { type: 'RESET_MATCH' }
