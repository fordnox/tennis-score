import { useState } from 'react'
import { X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { matchStarted } from '@/lib/match'
import {
  BEST_OF,
  MAX_NAME_LENGTH,
  TARGETS,
  type Action,
  type BestOf,
  type MatchState,
  type PlayerId,
  type Target,
} from '@/types'

interface Props {
  state: MatchState
  dispatch: React.Dispatch<Action>
  onClose: () => void
}

/** A format change queued behind the "this will start a new match" confirmation. */
type PendingFormat =
  | { kind: 'target'; value: Target }
  | { kind: 'bestOf'; value: BestOf }

export function SettingsView({ state, dispatch, onClose }: Props) {
  const [pending, setPending] = useState<PendingFormat | null>(null)
  const started = matchStarted(state)

  const applyFormat = (change: PendingFormat) => {
    if (change.kind === 'target') dispatch({ type: 'SET_TARGET', value: change.value })
    else dispatch({ type: 'SET_BEST_OF', value: change.value })
  }

  /**
   * Changing the format mid-match can leave an incoherent tally (dropping to
   * best-of-3 when someone already has 3 games), so it costs a confirmation
   * and a match reset. Before the first point it just applies.
   */
  const requestFormat = (change: PendingFormat) => {
    if (started) setPending(change)
    else applyFormat(change)
  }

  return (
    <div className="h-dvh w-dvw overflow-y-auto overscroll-contain bg-neutral-950 text-neutral-100 touch-manipulation">
      <div
        className="mx-auto flex max-w-md flex-col gap-8 px-6 pb-16"
        style={{
          paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        }}
      >
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Settings</h1>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
            <X className="size-5" />
          </Button>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs tracking-[0.15em] text-neutral-400 uppercase">Players</h2>
          {([0, 1] as PlayerId[]).map((p) => (
            <div key={p} className="flex flex-col gap-2">
              <Label htmlFor={`name-${p}`}>Player {p + 1}</Label>
              <Input
                id={`name-${p}`}
                value={state.names[p]}
                maxLength={MAX_NAME_LENGTH}
                placeholder={`Player ${p + 1}`}
                autoComplete="off"
                autoCapitalize="words"
                spellCheck={false}
                className="h-12 text-base"
                onChange={(e) =>
                  dispatch({ type: 'SET_NAME', player: p, value: e.target.value })
                }
              />
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs tracking-[0.15em] text-neutral-400 uppercase">Format</h2>

          <div className="flex flex-col gap-2">
            <Label>Points per game</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={String(state.target)}
              onValueChange={(v) =>
                v && requestFormat({ kind: 'target', value: Number(v) as Target })
              }
              className="w-full"
            >
              {TARGETS.map((t) => (
                <ToggleGroupItem key={t} value={String(t)} className="h-12 flex-1 text-base">
                  {t}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-neutral-500">Must win by 2.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Match length</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={String(state.bestOf)}
              onValueChange={(v) =>
                v && requestFormat({ kind: 'bestOf', value: Number(v) as BestOf })
              }
              className="w-full"
            >
              {BEST_OF.map((b) => (
                <ToggleGroupItem key={b} value={String(b)} className="h-12 flex-1 text-base">
                  Best of {b}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </section>

        {/* New game / new match live in the board menu — they are in-play
            actions, not configuration. */}
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new match?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing the format mid-match resets the score and games won.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) applyFormat(pending)
                dispatch({ type: 'RESET_MATCH' })
                setPending(null)
              }}
            >
              Change and reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
