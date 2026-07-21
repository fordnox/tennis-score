import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SHORTCUTS } from '@/lib/shortcuts'
import type { Pair, PlayerId } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Display names, so the rows name the players rather than "Player 1". */
  names: Pair<string>
}

const PLAYERS: PlayerId[] = [0, 1]

const VERB = {
  score: 'Add a point',
  undo: 'Take a point back',
} as const

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="min-w-8 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-center text-sm font-medium text-neutral-100">
      {children}
    </kbd>
  )
}

export function ShortcutsDialog({ open, onOpenChange, names }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>For scoring from a keyboard instead of by tap.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {PLAYERS.map((player) => (
            <div key={player}>
              <p className="mb-2 truncate text-xs tracking-wide text-neutral-400 uppercase">
                {names[player]}
              </p>
              <ul className="flex flex-col gap-2">
                {SHORTCUTS.filter((s) => s.player === player).map((s) => (
                  <li key={s.key} className="flex items-center gap-3">
                    <Key>{s.label}</Key>
                    <span className="text-sm text-neutral-300">{VERB[s.action]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="rounded-lg bg-neutral-900 p-3 text-sm text-neutral-400">
          Each pair sits above the other on the keyboard — the upper key scores, the lower one
          undoes. Shortcuts are ignored while a menu, dialog or text field is open.
        </p>
      </DialogContent>
    </Dialog>
  )
}
