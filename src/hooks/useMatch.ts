import { useEffect, useReducer } from 'react'
import { rootReducer } from '@/lib/match'
import { load, save } from '@/lib/storage'
import type { Action, Store } from '@/types'

export function useMatch(): [Store, React.Dispatch<Action>] {
  // Lazy init so localStorage is read once, on mount, not on every render.
  const [store, dispatch] = useReducer(rootReducer, undefined, load)

  // The payload is well under a kilobyte and taps are human-paced, so writing
  // on every change is cheaper than the machinery to debounce it.
  useEffect(() => {
    save(store)
  }, [store])

  return [store, dispatch]
}
