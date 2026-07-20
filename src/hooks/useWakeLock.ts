import { useEffect } from 'react'

/**
 * Keeps the screen awake while a match is on — the phone is propped on the
 * table, untouched between rallies.
 *
 * Needs a secure context and isn't available everywhere (older iOS Safari in
 * particular), so every step is feature-detected and failure is silent.
 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let released = false

    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen')
      } catch {
        // Denied, or the tab lost visibility mid-request — not worth surfacing.
      }
    }

    // The lock is dropped whenever the tab is backgrounded, so re-take it.
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !released) void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinel?.release().catch(() => {})
    }
  }, [enabled])
}
