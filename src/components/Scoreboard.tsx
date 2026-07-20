import { useState } from 'react'
import { AboutDialog } from './AboutDialog'
import { BoardMenu } from './BoardMenu'
import { MatchOverOverlay } from './MatchOverOverlay'
import { PlayerPanel } from './PlayerPanel'
import { ServeIndicator } from './ServeIndicator'
import { displayName, gamesToWin } from '@/lib/match'
import type { Action, MatchState, PlayerId } from '@/types'

interface Props {
  state: MatchState
  dispatch: React.Dispatch<Action>
  onOpenSettings: () => void
  onOpenHistory: () => void
}

export function Scoreboard({ state, dispatch, onOpenSettings, onOpenHistory }: Props) {
  const [showAbout, setShowAbout] = useState(false)
  const needed = gamesToWin(state.bestOf)
  const over = state.matchWinner !== null

  const panel = (p: PlayerId) => (
    <PlayerPanel
      player={p}
      name={displayName(state, p)}
      points={state.points[p]}
      games={state.games[p]}
      gamesNeeded={needed}
      serving={state.server === p}
      disabled={over}
      onScore={() => dispatch({ type: 'POINT', player: p })}
      onUndo={() => dispatch({ type: 'UNDO_FOR', player: p })}
    />
  )

  return (
    <div className="relative flex h-dvh w-dvw overflow-hidden bg-black portrait:flex-col landscape:flex-row">
      {panel(0)}
      <ServeIndicator
        serverName={displayName(state, state.server)}
        onToggle={() => dispatch({ type: 'TOGGLE_SERVER' })}
      />
      {panel(1)}

      {/* Bottom-right, within thumb reach. Inset from the safe area so it clears
          the iOS home indicator and any gesture bar. */}
      <div className="absolute right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-10 flex items-center gap-1">
        {/* The format in play, so it can be checked without opening settings.
            Not interactive — pointer-events-none keeps it from shrinking the
            adjacent tap targets. */}
        <span className="pointer-events-none mr-1 text-[11px] tracking-wide text-white/40 uppercase tabular-nums">
          {state.target} pts &middot; best of {state.bestOf}
        </span>
        <BoardMenu
          onNewGame={() => dispatch({ type: 'RESET_GAME' })}
          onNewMatch={() => dispatch({ type: 'RESET_MATCH' })}
          onOpenHistory={onOpenHistory}
          onOpenSettings={onOpenSettings}
          onOpenAbout={() => setShowAbout(true)}
        />
      </div>

      {state.matchWinner !== null && (
        <MatchOverOverlay
          winnerName={displayName(state, state.matchWinner)}
          games={state.games}
          onNewMatch={() => dispatch({ type: 'RESET_MATCH' })}
          onUndo={() => dispatch({ type: 'UNDO_FOR', player: state.matchWinner as PlayerId })}
        />
      )}

      <AboutDialog open={showAbout} onOpenChange={setShowAbout} />
    </div>
  )
}
