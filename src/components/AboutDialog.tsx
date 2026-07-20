import { ChevronDown, Hand, Menu, Repeat2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ControlProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Control({ icon, title, children }: ControlProps) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-neutral-300">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-neutral-100">{title}</p>
        <p className="text-sm text-neutral-400">{children}</p>
      </div>
    </li>
  )
}

export function AboutDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>How it works</DialogTitle>
          <DialogDescription>Everything is saved on this device.</DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-4 py-2">
          <Control icon={<Hand className="size-4" />} title="Tap to score">
            Tap anywhere on a player's half to give them a point.
          </Control>

          <Control icon={<ChevronDown className="size-4" />} title="Swipe down to undo">
            Swipe down on a player's half to take a point back. If it was the point they just
            scored, this also un-does the game or match it won.
          </Control>

          <Control icon={<Repeat2 className="size-4" />} title="Serve">
            The glowing dot beside a name marks who is serving. Tap the <b>Serve</b> button in the
            middle to switch. It never changes on its own.
          </Control>

          <Control icon={<Menu className="size-4" />} title="Menu">
            The button in the bottom corner holds everything else: start a new game or match, the
            history of finished matches, and settings for names and format.
          </Control>
        </ul>

        <div className="rounded-lg bg-neutral-900 p-3 text-sm text-neutral-400">
          <p className="font-medium text-neutral-200">Scoring</p>
          <p className="mt-1">
            A game must be won by two clear points — at 10-10 (or 20-20) play continues until
            someone leads by two. The dots under each name are games won.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
