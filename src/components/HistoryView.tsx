import { useState } from 'react'
import { Trophy, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MatchRecord, PlayerId } from '@/types'

interface Props {
  records: MatchRecord[]
  onClear: () => void
  onClose: () => void
}

const nameOf = (r: MatchRecord, p: PlayerId) => r.names[p].trim() || `Player ${p + 1}`

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function MatchCard({ record }: { record: MatchRecord }) {
  const players: PlayerId[] = [0, 1]

  return (
    <li className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-neutral-500">{formatDate(record.finishedAt)}</span>
        <span className="text-xs text-neutral-500">
          {record.target} pts &middot; best of {record.bestOf}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        {players.map((p) => (
          <div key={p} className="flex items-center gap-2">
            {record.winner === p ? (
              <Trophy className="size-4 shrink-0 text-amber-400" aria-label="winner" />
            ) : (
              <span className="size-4 shrink-0" />
            )}
            <span
              className={cn(
                'truncate',
                record.winner === p ? 'font-semibold text-neutral-100' : 'text-neutral-400',
              )}
            >
              {nameOf(record, p)}
            </span>
            <span
              className={cn(
                'ml-auto text-lg tabular-nums',
                record.winner === p ? 'font-semibold text-neutral-100' : 'text-neutral-400',
              )}
            >
              {record.games[p]}
            </span>
          </div>
        ))}
      </div>

      {record.completed.length > 0 && (
        <p className="mt-3 border-t border-neutral-800 pt-2 text-xs text-neutral-500 tabular-nums">
          {record.completed.map((g) => `${g[0]}-${g[1]}`).join('  ·  ')}
        </p>
      )}
    </li>
  )
}

export function HistoryView({ records, onClear, onClose }: Props) {
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="h-dvh w-dvw touch-manipulation overflow-y-auto overscroll-contain bg-neutral-950 text-neutral-100">
      <div
        className="mx-auto flex max-w-md flex-col gap-6 px-6 pb-16"
        style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Match history</h1>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close history">
            <X className="size-5" />
          </Button>
        </header>

        {records.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-500">
            No finished matches yet.
            <br />
            Matches are saved here once someone wins.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {records.map((r) => (
                <MatchCard key={r.id} record={r} />
              ))}
            </ul>

            <Button
              variant="outline"
              className="h-12 text-red-400 hover:text-red-400"
              onClick={() => setConfirmClear(true)}
            >
              Clear history
            </Button>
          </>
        )}
      </div>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear match history?</AlertDialogTitle>
            <AlertDialogDescription>
              All {records.length} saved {records.length === 1 ? 'match' : 'matches'} will be
              deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClear()
                setConfirmClear(false)
              }}
            >
              Clear history
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
