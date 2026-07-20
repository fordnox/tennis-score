export type PlayerId = 0 | 1
export type Pair<T> = [T, T]

export type Target = 11 | 21
export type BestOf = 3 | 5 | 7

export const TARGETS: Target[] = [11, 21]
export const BEST_OF: BestOf[] = [3, 5, 7]

export const STORAGE_KEY = 'tt-scoreboard-v1'
export const STATE_VERSION = 1
export const HISTORY_LIMIT = 20
export const MAX_NAME_LENGTH = 14

/**
 * Describes the most recent state-changing action, so a swipe-down can tell
 * "undo the point I just scored" from "nudge this score down by one".
 */
export type LastAction = { type: 'point'; player: PlayerId } | { type: 'other' } | null

export interface MatchState {
  version: typeof STATE_VERSION
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
  /** Undo stack of prior states, newest last, capped at HISTORY_LIMIT. */
  history: MatchState[]
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
