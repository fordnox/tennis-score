import { ChevronDown } from 'lucide-react'
import { GamePips } from './GamePips'
import { useScoreGestures } from '@/hooks/useScoreGestures'
import { cn } from '@/lib/utils'
import type { PlayerId } from '@/types'

interface Props {
  player: PlayerId
  name: string
  points: number
  games: number
  gamesNeeded: number
  serving: boolean
  disabled: boolean
  onScore: () => void
  onUndo: () => void
}

/** Per-player tint, kept distinguishable across a table rather than up close. */
const THEME: Record<PlayerId, string> = {
  0: 'bg-teal-950/60 text-teal-200',
  1: 'bg-orange-950/60 text-orange-200',
}

export function PlayerPanel({
  player,
  name,
  points,
  games,
  gamesNeeded,
  serving,
  disabled,
  onScore,
  onUndo,
}: Props) {
  const gestures = useScoreGestures({ onTap: onScore, onSwipeDown: onUndo, disabled })

  return (
    <div
      {...gestures}
      role="button"
      tabIndex={0}
      aria-label={`${name}, ${points} points. Tap to score, swipe down to undo.`}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onScore()
        }
        if (e.key === 'ArrowDown' || e.key === 'Backspace') {
          e.preventDefault()
          onUndo()
        }
      }}
      className={cn(
        'relative flex flex-1 select-none flex-col items-center justify-center',
        // touch-none is what stops scrolling stealing the swipe, and it also
        // suppresses double-tap zoom on this element.
        'touch-none outline-none',
        'transition-[filter] duration-100 active:brightness-125',
        THEME[player],
      )}
    >
      <div className="flex max-w-full items-center gap-2 px-4">
        {serving && (
          <span
            aria-label="serving"
            className="size-3 shrink-0 rounded-full bg-current shadow-[0_0_12px_currentColor]"
          />
        )}
        <span className="truncate text-[4vmin] font-medium tracking-wide uppercase opacity-80">
          {name}
        </span>
      </div>

      <span className="text-[30vmin] leading-none font-bold tabular-nums">{points}</span>

      <div className="flex flex-col items-center gap-2">
        <GamePips won={games} needed={gamesNeeded} />
        <ChevronDown className="size-5 opacity-25" aria-hidden />
      </div>
    </div>
  )
}
