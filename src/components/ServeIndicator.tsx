import { ArrowLeftRight } from 'lucide-react'

interface Props {
  serverName: string
  onToggle: () => void
}

/**
 * The divider between the two panels. Sitting outside both of them is what
 * keeps switching serve from ever registering as a point — no event-stopping
 * required. Who is serving is shown on the panels themselves; this is the
 * switch.
 */
export function ServeIndicator({ serverName, onToggle }: Props) {
  return (
    // z-10 is load-bearing: the panels either side are `relative`, so without
    // it they paint over the pill (which overflows this hairline strip) and
    // swallow taps on half of it.
    <div className="relative z-10 flex shrink-0 items-center justify-center bg-black portrait:h-px portrait:w-full landscape:h-full landscape:w-px">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${serverName} is serving. Tap to switch server.`}
        className="absolute flex touch-manipulation items-center gap-2 rounded-full border border-white/15 bg-neutral-900 px-4 py-2.5 text-xs font-medium tracking-wide text-neutral-300 uppercase shadow-lg active:bg-neutral-800"
      >
        <ArrowLeftRight className="size-4" aria-hidden />
        Serve
      </button>
    </div>
  )
}
