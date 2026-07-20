import { cn } from '@/lib/utils'

interface Props {
  won: number
  needed: number
  className?: string
}

/** One dot per game needed to take the match; filled dots are games already won. */
export function GamePips({ won, needed, className }: Props) {
  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      aria-label={`${won} of ${needed} games won`}
    >
      {Array.from({ length: needed }, (_, i) => (
        <span
          key={i}
          className={cn(
            'size-2.5 rounded-full transition-colors',
            i < won ? 'bg-current' : 'bg-current/25',
          )}
        />
      ))}
    </div>
  )
}
