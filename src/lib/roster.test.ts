import { describe, expect, it } from 'vitest'
import { mergeRoster } from './roster'
import { MAX_NAME_LENGTH, ROSTER_LIMIT } from '@/types'

describe('mergeRoster', () => {
  it('puts fresh names first and keeps the rest in order', () => {
    expect(mergeRoster(['Ann', 'Bo', 'Cy'], ['Dee', 'Bo'])).toEqual(['Dee', 'Bo', 'Ann', 'Cy'])
  })

  it('dedupes case-insensitively, keeping the newest spelling', () => {
    expect(mergeRoster(['andy'], ['Andy'])).toEqual(['Andy'])
    expect(mergeRoster([], ['Sam', 'sam', 'SAM'])).toEqual(['Sam'])
  })

  it('drops empty and whitespace-only names', () => {
    expect(mergeRoster(['Ann'], ['', '   '])).toEqual(['Ann'])
  })

  it('trims and caps names at the maximum length', () => {
    const merged = mergeRoster([], ['  Bartholomew Fitzgerald  '])
    expect(merged).toHaveLength(1)
    expect(merged[0]).toBe('Bartholomew Fitzgerald'.slice(0, MAX_NAME_LENGTH))
  })

  it('caps the roster, dropping the oldest names', () => {
    const old = Array.from({ length: ROSTER_LIMIT }, (_, i) => `Old${i}`)
    const merged = mergeRoster(old, ['New'])
    expect(merged).toHaveLength(ROSTER_LIMIT)
    expect(merged[0]).toBe('New')
    expect(merged).not.toContain(`Old${ROSTER_LIMIT - 1}`)
  })
})
