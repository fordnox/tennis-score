/**
 * Isolated so match.ts stays pure and testable — this is the one piece of
 * match setup that cannot be a function of its inputs.
 */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  // randomUUID needs a secure context; over plain-HTTP LAN it may be missing.
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
