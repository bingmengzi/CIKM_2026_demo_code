import { cn } from '@/lib/utils'
import type { AgentStatus } from '@/types'

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold transition-all duration-300',
        status === 'idle' && 'text-text-muted bg-transparent',
        status === 'thinking' && 'text-accent bg-accent-light',
        status === 'awaiting_review' && 'text-warning bg-warning-light',
        status === 'done' && 'text-success bg-success-light'
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          status === 'idle' && 'bg-text-muted',
          status === 'thinking' && 'bg-accent animate-pulse-dot',
          status === 'awaiting_review' && 'bg-warning animate-pulse-dot',
          status === 'done' && 'bg-success'
        )}
      />
      {status === 'idle' && 'Waiting'}
      {status === 'thinking' && 'Thinking'}
      {status === 'awaiting_review' && 'Review'}
      {status === 'done' && 'Done'}
    </span>
  )
}
