import { Check, Loader2 } from 'lucide-react'

interface ProgressItem {
  label: string
  done: boolean
}

interface ProgressIndicatorProps {
  items: ProgressItem[]
  title: string
}

export function ProgressIndicator({ items, title }: ProgressIndicatorProps) {
  const completed = items.filter((i) => i.done).length

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2 animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
        <p className="text-[12px] text-text-muted uppercase tracking-wide font-bold">{title}</p>
        <span className="text-[13px] text-text-secondary font-semibold">{completed}/{items.length}</span>
      </div>
      {/* Progress bar */}
      <div className="h-2 rounded-full bg-border-light mb-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-agent-design transition-all duration-700 ease-out"
          style={{ width: `${(completed / items.length) * 100}%` }}
        />
      </div>
      {/* Items list */}
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 text-[14px] animate-phase-row-in"
            style={{ animationDelay: `${120 + idx * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
          >
            {item.done ? (
              <Check size={14} className="text-success shrink-0" strokeWidth={2.5} />
            ) : (
              <Loader2 size={14} className="text-accent shrink-0 animate-spin" />
            )}
            <span className={item.done ? 'text-text-secondary' : 'text-text-primary font-medium'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
