import { ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  serverName: string
  /** The rules say the serve changes hands now — glow until it's toggled. */
  switchDue: boolean
  onToggle: () => void
}

/**
 * The divider between the two panels. Sitting outside both of them is what
 * keeps switching serve from ever registering as a point — no event-stopping
 * required. Who is serving is shown on the panels themselves; this is the
 * switch.
 */
export function ServeIndicator({ serverName, switchDue, onToggle }: Props) {
  return (
    // z-10 is load-bearing: the panels either side are `relative`, so without
    // it they paint over the pill (which overflows this hairline strip) and
    // swallow taps on half of it.
    <div className="relative z-10 flex shrink-0 items-center justify-center bg-black portrait:h-px portrait:w-full landscape:h-full landscape:w-px">
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          switchDue
            ? `${serverName} is serving. Time to switch serve. Tap to switch server.`
            : `${serverName} is serving. Tap to switch server.`
        }
        className={cn(
          'absolute flex touch-manipulation items-center gap-2.5 rounded-full border bg-neutral-900 px-7 py-4 text-sm font-medium tracking-wide uppercase shadow-lg transition-colors active:bg-neutral-800',
          switchDue
            ? 'animate-pulse border-white/70 text-white shadow-[0_0_24px_rgba(255,255,255,0.45)]'
            : 'border-white/15 text-neutral-300',
        )}
      >
        <ArrowLeftRight className="size-5" aria-hidden />
        Serve
      </button>
    </div>
  )
}
