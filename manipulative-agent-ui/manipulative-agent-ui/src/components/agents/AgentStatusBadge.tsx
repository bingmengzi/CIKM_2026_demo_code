import { cn } from '@/lib/utils'
import type { AgentStatus } from '@/types'

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
        status === 'idle' && 'text-text-muted',
        status === 'thinking' && 'text-warning',
        status === 'awaiting_review' && 'text-accent',
        status === 'done' && 'text-success'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'idle' && 'bg-text-muted',
          status === 'thinking' && 'bg-warning animate-pulse-dot',
          status === 'awaiting_review' && 'bg-accent animate-pulse-dot',
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
