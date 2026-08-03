import { describe, expect, it } from 'vitest'
import {
  gamesToWin,
  initialState,
  initialStore,
  isGameWon,
  rootReducer,
  serveSwitchDue,
} from './match'
import type { Action, MatchState, PlayerId, Store } from '@/types'

const run = (store: Store, actions: Action[]) => actions.reduce(rootReducer, store)
const point = (player: PlayerId): Action => ({ type: 'POINT', player })
/**
 * Actions reaching a final score of n-m: the players trade points level for as
 * long as they can, then the leader takes the rest. Trading first matters —
 * awarding one player every point up front would end the game early.
 */
const rally = (n: number, m: number): Action[] => {
  const level = Math.min(n, m)
  const leader: PlayerId = n > m ? 0 : 1
  return [
    ...Array.from({ length: level }, () => [point(0), point(1)]).flat(),
    ...Array.from({ length: Math.abs(n - m) }, () => point(leader)),
  ]
}

const start = (over: Partial<MatchState> = {}): Store => ({
  state: initialState(over),
  history: [],
})

describe('gamesToWin', () => {
  it('is a majority of bestOf', () => {
    expect(gamesToWin(3)).toBe(2)
    expect(gamesToWin(5)).toBe(3)
    expect(gamesToWin(7)).toBe(4)
  })
})

describe('isGameWon', () => {
  it('awards the game at target with a two-point lead', () => {
    expect(isGameWon([11, 9], 11)).toBe(0)
    expect(isGameWon([9, 11], 11)).toBe(1)
  })

  it('withholds the game at target with a one-point lead', () => {
    expect(isGameWon([11, 10], 11)).toBeNull()
    expect(isGameWon([10, 10], 11)).toBeNull()
  })

  it('extends past target until someone leads by two', () => {
    expect(isGameWon([12, 11], 11)).toBeNull()
    expect(isGameWon([12, 10], 11)).toBe(0)
    expect(isGameWon([22, 20], 21)).toBe(0)
    expect(isGameWon([25, 23], 21)).toBe(0)
  })
})

describe('scoring a game', () => {
  it('banks the game at 11-9 and resets the points', () => {
    const s = run(start(), rally(11, 9)).state
    expect(s.games).toEqual([1, 0])
    expect(s.points).toEqual([0, 0])
    expect(s.completed).toEqual([[11, 9]])
    expect(s.matchWinner).toBeNull()
  })

  it('plays through deuce to 12-10', () => {
    // 10-10, then two straight to p0.
    const deuce = run(start(), rally(10, 10))
    expect(deuce.state.points).toEqual([10, 10])

    const afterOne = rootReducer(deuce, point(0))
    expect(afterOne.state.points).toEqual([11, 10])
    expect(afterOne.state.games).toEqual([0, 0])

    const afterTwo = rootReducer(afterOne, point(0))
    expect(afterTwo.state.points).toEqual([0, 0])
    expect(afterTwo.state.games).toEqual([1, 0])
    expect(afterTwo.state.completed).toEqual([[12, 10]])
  })

  it('plays a 21-point game through to 22-20', () => {
    const s = run(start({ target: 21 }), [...rally(20, 20), point(0), point(0)]).state
    expect(s.games).toEqual([1, 0])
    expect(s.completed).toEqual([[22, 20]])
  })
})

describe('winning the match', () => {
  it('ends best-of-5 at three games', () => {
    let store = start({ bestOf: 5 })
    for (let i = 0; i < 3; i++) store = run(store, rally(11, 0))

    expect(store.state.games).toEqual([3, 0])
    expect(store.state.matchWinner).toBe(0)
  })

  it('ignores further points once decided', () => {
    let store = start({ bestOf: 3 })
    for (let i = 0; i < 2; i++) store = run(store, rally(11, 0))
    expect(store.state.matchWinner).toBe(0)

    const after = rootReducer(store, point(1))
    expect(after).toBe(store)
    expect(after.state.points).toEqual([0, 0])
  })
})

describe('undo', () => {
  it('reverses the point just scored by that player', () => {
    const store = run(start(), [point(0), point(0), point(1)])
    expect(store.state.points).toEqual([2, 1])

    const undone = rootReducer(store, { type: 'UNDO_FOR', player: 1 })
    expect(undone.state.points).toEqual([2, 0])
  })

  it('decrements when the last point belonged to the other player', () => {
    const store = run(start(), [point(0), point(0), point(1)])
    // p1 scored last, so swiping p0 is a correction, not a history pop.
    const undone = rootReducer(store, { type: 'UNDO_FOR', player: 0 })
    expect(undone.state.points).toEqual([1, 1])
  })

  it('un-ends a game when undoing the point that won it', () => {
    const store = run(start(), rally(11, 9))
    expect(store.state.games).toEqual([1, 0])

    const undone = rootReducer(store, { type: 'UNDO_FOR', player: 0 })
    expect(undone.state.points).toEqual([10, 9])
    expect(undone.state.games).toEqual([0, 0])
    expect(undone.state.completed).toEqual([])
  })

  it('un-ends the match when undoing the winning point', () => {
    let store = start({ bestOf: 3 })
    for (let i = 0; i < 2; i++) store = run(store, rally(11, 0))
    expect(store.state.matchWinner).toBe(0)

    const undone = rootReducer(store, { type: 'UNDO_FOR', player: 0 })
    expect(undone.state.matchWinner).toBeNull()
    expect(undone.state.points).toEqual([10, 0])
    expect(undone.state.games).toEqual([1, 0])
  })

  it('never drives a score below zero', () => {
    const undone = rootReducer(initialStore(), { type: 'UNDO_FOR', player: 0 })
    expect(undone.state.points).toEqual([0, 0])
  })
})

describe('serveSwitchDue', () => {
  it('falls due every fifth point in an 11-point game', () => {
    expect(serveSwitchDue(initialState())).toBe(false)
    expect(serveSwitchDue(run(start(), rally(2, 2)).state)).toBe(false)
    expect(serveSwitchDue(run(start(), rally(3, 2)).state)).toBe(true)
    expect(serveSwitchDue(run(start(), rally(4, 2)).state)).toBe(false)
  })

  it('falls due every fifth point in a 21-point game', () => {
    expect(serveSwitchDue(run(start({ target: 21 }), rally(2, 2)).state)).toBe(false)
    expect(serveSwitchDue(run(start({ target: 21 }), rally(3, 2)).state)).toBe(true)
    expect(serveSwitchDue(run(start({ target: 21 }), rally(5, 5)).state)).toBe(true)
  })

  it('falls due every point from deuce on', () => {
    const deuce = run(start(), rally(10, 10))
    expect(serveSwitchDue(deuce.state)).toBe(true)
    // 11-10: an odd total, due only because of the deuce rule.
    expect(serveSwitchDue(rootReducer(deuce, point(0)).state)).toBe(true)
  })

  it('falls due at the start of every game but the first', () => {
    const s = run(start(), rally(11, 0)).state
    expect(s.points).toEqual([0, 0])
    expect(serveSwitchDue(s)).toBe(true)
  })

  it('never falls due once the match is decided', () => {
    let store = start({ bestOf: 3 })
    for (let i = 0; i < 2; i++) store = run(store, rally(11, 0))
    expect(store.state.matchWinner).toBe(0)
    expect(serveSwitchDue(store.state)).toBe(false)
  })
})

describe('config and resets', () => {
  it('keeps games when resetting only the game', () => {
    const store = run(start(), [...rally(11, 0), point(0), point(1)])
    const s = rootReducer(store, { type: 'RESET_GAME' }).state
    expect(s.points).toEqual([0, 0])
    expect(s.games).toEqual([1, 0])
  })

  it('keeps names and config when resetting the match', () => {
    const store = run(start({ names: ['Ann', 'Bo'], target: 21, bestOf: 7 }), rally(21, 0))
    const s = rootReducer(store, { type: 'RESET_MATCH' }).state
    expect(s.names).toEqual(['Ann', 'Bo'])
    expect(s.target).toBe(21)
    expect(s.bestOf).toBe(7)
    expect(s.games).toEqual([0, 0])
    expect(s.completed).toEqual([])
  })

  it('toggles the server without touching the score', () => {
    const store = run(start(), [point(0)])
    const s = rootReducer(store, { type: 'TOGGLE_SERVER' }).state
    expect(s.server).toBe(1)
    expect(s.points).toEqual([1, 0])
  })

  it('swaps the names without touching the score', () => {
    const store = run(start({ names: ['Ann', 'Bo'] }), [point(0)])
    const s = rootReducer(store, { type: 'SWAP_NAMES' }).state
    expect(s.names).toEqual(['Bo', 'Ann'])
    expect(s.points).toEqual([1, 0])
  })

  it('caps names at the maximum length', () => {
    const s = rootReducer(initialStore(), {
      type: 'SET_NAME',
      player: 0,
      value: 'Bartholomew Fitzgerald',
    }).state
    expect(s.names[0]).toHaveLength(14)
  })
})
