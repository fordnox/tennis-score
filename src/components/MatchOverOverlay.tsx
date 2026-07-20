import { Button } from '@/components/ui/button'
import type { Pair } from '@/types'

interface Props {
  winnerName: string
  games: Pair<number>
  onNewMatch: () => void
  onUndo: () => void
}

export function MatchOverOverlay({ winnerName, games, onNewMatch, onUndo }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-black/85 px-8 text-center backdrop-blur-sm">
      <div>
        <p className="text-sm tracking-[0.2em] text-neutral-400 uppercase">Match won by</p>
        <p className="mt-2 text-4xl font-bold text-white">{winnerName}</p>
        <p className="mt-3 text-2xl text-neutral-300 tabular-nums">
          {games[0]} &ndash; {games[1]}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button size="lg" className="h-14 text-base" onClick={onNewMatch}>
          New match
        </Button>
        {/* The last point may simply have been a mis-tap — always offer a way back. */}
        <Button size="lg" variant="ghost" className="h-12 text-neutral-300" onClick={onUndo}>
          Undo last point
        </Button>
      </div>
    </div>
  )
}
