import { describe, expect, it } from 'vitest'
import { remove, toRecord, upsert } from './history'
import { initialState } from './match'
import { MATCH_HISTORY_LIMIT, type MatchRecord } from '@/types'

const record = (id: string, over: Partial<MatchRecord> = {}): MatchRecord => ({
  id,
  finishedAt: '2026-07-20T18:00:00.000Z',
  names: ['Andy', 'Sam'],
  target: 11,
  bestOf: 3,
  games: [2, 0],
  completed: [
    [11, 9],
    [11, 7],
  ],
  winner: 0,
  ...over,
})

describe('toRecord', () => {
  it('captures the finished match', () => {
    const state = initialState({
      matchId: 'm1',
      names: ['Andy', 'Sam'],
      games: [2, 1],
      completed: [
        [11, 9],
        [8, 11],
        [11, 5],
      ],
      matchWinner: 0,
    })

    const r = toRecord(state, 0, '2026-07-20T18:00:00.000Z')
    expect(r.id).toBe('m1')
    expect(r.winner).toBe(0)
    expect(r.games).toEqual([2, 1])
    expect(r.completed).toHaveLength(3)
  })
})

describe('upsert', () => {
  it('puts the newest match first', () => {
    const list = upsert(upsert([], record('a')), record('b'))
    expect(list.map((r) => r.id)).toEqual(['b', 'a'])
  })

  it('replaces rather than duplicates a match already archived', () => {
    const list = upsert(upsert([], record('a')), record('a', { games: [2, 1] }))
    expect(list).toHaveLength(1)
    expect(list[0].games).toEqual([2, 1])
  })

  it('drops the oldest once the cap is reached', () => {
    let list: MatchRecord[] = []
    for (let i = 0; i < MATCH_HISTORY_LIMIT + 5; i++) list = upsert(list, record(`m${i}`))

    expect(list).toHaveLength(MATCH_HISTORY_LIMIT)
    expect(list[0].id).toBe(`m${MATCH_HISTORY_LIMIT + 4}`)
    expect(list.some((r) => r.id === 'm0')).toBe(false)
  })
})

describe('remove', () => {
  it('un-archives a match whose winning point was undone', () => {
    const list = upsert(upsert([], record('a')), record('b'))
    expect(remove(list, 'b').map((r) => r.id)).toEqual(['a'])
  })

  it('is a no-op for an unknown id', () => {
    const list = upsert([], record('a'))
    expect(remove(list, 'nope')).toHaveLength(1)
  })
})
