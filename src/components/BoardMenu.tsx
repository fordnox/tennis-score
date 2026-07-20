import { useState } from 'react'
import { Clock, Info, Menu, RotateCcw, Settings, Trash2 } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  onNewGame: () => void
  onNewMatch: () => void
  onOpenHistory: () => void
  onOpenSettings: () => void
  onOpenAbout: () => void
}

/** Roomy rows — this is driven by thumb, not cursor. */
const ITEM = 'gap-3 px-3 py-3 text-base'

export function BoardMenu({
  onNewGame,
  onNewMatch,
  onOpenHistory,
  onOpenSettings,
  onOpenAbout,
}: Props) {
  const [confirmNewMatch, setConfirmNewMatch] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menu"
          className="touch-manipulation rounded-full bg-black/40 p-3 text-white/50 active:text-white"
        >
          <Menu className="size-5" aria-hidden />
        </DropdownMenuTrigger>

        {/* Opens upward: the trigger sits at the bottom of the screen. */}
        <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-60">
          <DropdownMenuItem className={ITEM} onSelect={onNewGame}>
            <RotateCcw />
            <span>New game</span>
            <span className="ml-auto text-xs text-neutral-500">Keeps games</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className={ITEM}
            variant="destructive"
            // Deferred to a confirmation rather than fired here — this wipes a
            // match in progress.
            onSelect={() => setConfirmNewMatch(true)}
          >
            <Trash2 />
            <span>New match</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className={ITEM} onSelect={onOpenHistory}>
            <Clock />
            <span>Match history</span>
          </DropdownMenuItem>

          <DropdownMenuItem className={ITEM} onSelect={onOpenSettings}>
            <Settings />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem className={ITEM} onSelect={onOpenAbout}>
            <Info />
            <span>How it works</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmNewMatch} onOpenChange={setConfirmNewMatch}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new match?</AlertDialogTitle>
            <AlertDialogDescription>
              The current score and games won will be cleared. Player names and format are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onNewMatch()
                setConfirmNewMatch(false)
              }}
            >
              New match
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
