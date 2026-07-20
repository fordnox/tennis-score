import {
  HISTORY_LIMIT,
  MAX_NAME_LENGTH,
  STATE_VERSION,
  type Action,
  type BestOf,
  type MatchState,
  type Pair,
  type PlayerId,
  type Store,
} from '@/types'

export const other = (p: PlayerId): PlayerId => (p === 0 ? 1 : 0)

/** Games needed to take the match: 2 of 3, 3 of 5, 4 of 7. */
export const gamesToWin = (bestOf: BestOf) => (bestOf + 1) / 2

/**
 * Win-by-2 needs no special deuce branch — `>= target && lead >= 2` covers
 * 11-9, 12-10 and 25-23 alike. Table tennis has no sudden-death cap.
 */
export function isGameWon(points: Pair<number>, target: number): PlayerId | null {
  const [a, b] = points
  if (a >= target && a - b >= 2) return 0
  if (b >= target && b - a >= 2) return 1
  return null
}

/** True once the score is level at one short of target — 10-10, 20-20, 13-13. */
export function isDeuce(points: Pair<number>, target: number): boolean {
  return points[0] >= target - 1 && points[0] === points[1]
}

export function initialState(overrides: Partial<MatchState> = {}): MatchState {
  return {
    version: STATE_VERSION,
    names: ['', ''],
    target: 11,
    bestOf: 5,
    points: [0, 0],
    games: [0, 0],
    server: 0,
    completed: [],
    matchWinner: null,
    lastAction: null,
    ...overrides,
  }
}

export const initialStore = (): Store => ({ state: initialState(), history: [] })

/** Keeps names, target and bestOf; clears everything about the match in progress. */
export const resetMatch = (s: MatchState): MatchState =>
  initialState({ names: s.names, target: s.target, bestOf: s.bestOf, server: s.server })

/** Clears the current game only; games already won are kept. */
export const resetGame = (s: MatchState): MatchState => ({
  ...s,
  points: [0, 0],
  matchWinner: null,
  lastAction: { type: 'other' },
})

export const displayName = (s: MatchState, p: PlayerId) =>
  s.names[p].trim() || `Player ${p + 1}`

/** A match is "in progress" once anything has been scored — used to guard config changes. */
export const matchStarted = (s: MatchState) =>
  s.points[0] > 0 || s.points[1] > 0 || s.games[0] > 0 || s.games[1] > 0

function scorePoint(s: MatchState, player: PlayerId): MatchState {
  const points: Pair<number> = [...s.points] as Pair<number>
  points[player] += 1

  const next: MatchState = { ...s, points, lastAction: { type: 'point', player } }

  const winner = isGameWon(points, s.target)
  if (winner === null) return next

  const games: Pair<number> = [...s.games] as Pair<number>
  games[winner] += 1

  return {
    ...next,
    games,
    completed: [...s.completed, points],
    points: [0, 0],
    matchWinner: games[winner] === gamesToWin(s.bestOf) ? winner : null,
  }
}

export function matchReducer(s: MatchState, action: Action): MatchState {
  switch (action.type) {
    case 'POINT':
      // Nothing more can be scored once the match is decided.
      return s.matchWinner !== null ? s : scorePoint(s, action.player)

    case 'UNDO_FOR': {
      // The history-pop path lives in rootReducer; this is the plain decrement.
      const points: Pair<number> = [...s.points] as Pair<number>
      points[action.player] = Math.max(0, points[action.player] - 1)
      return { ...s, points, lastAction: { type: 'other' } }
    }

    case 'SET_NAME': {
      const names: Pair<string> = [...s.names] as Pair<string>
      names[action.player] = action.value.slice(0, MAX_NAME_LENGTH)
      return { ...s, names }
    }

    case 'SET_TARGET':
      return { ...s, target: action.value }

    case 'SET_BEST_OF':
      return { ...s, bestOf: action.value }

    case 'TOGGLE_SERVER':
      return { ...s, server: other(s.server) }

    case 'SET_SERVER':
      return { ...s, server: action.player }

    case 'RESET_GAME':
      return resetGame(s)

    case 'RESET_MATCH':
      return resetMatch(s)
  }
}

/**
 * Wraps matchReducer with the undo stack.
 *
 * Only POINT is pushed onto history — it is the sole action a swipe-down is
 * meant to reverse. Popping restores points, games and completed together, so
 * undoing the point that ended a game also un-ends the game.
 */
export function rootReducer(store: Store, action: Action): Store {
  const { state, history } = store

  if (action.type === 'UNDO_FOR') {
    const last = state.lastAction
    if (history.length > 0 && last?.type === 'point' && last.player === action.player) {
      return { state: history[history.length - 1], history: history.slice(0, -1) }
    }
    return { state: matchReducer(state, action), history }
  }

  if (action.type === 'POINT') {
    const next = matchReducer(state, action)
    if (next === state) return store // match already over
    return { state: next, history: [...history, state].slice(-HISTORY_LIMIT) }
  }

  const next = matchReducer(state, action)
  if (next === state) return store

  // Resets and config changes invalidate the stack rather than being undoable.
  const clearsHistory = action.type === 'RESET_GAME' || action.type === 'RESET_MATCH'
  return { state: next, history: clearsHistory ? [] : history }
}
