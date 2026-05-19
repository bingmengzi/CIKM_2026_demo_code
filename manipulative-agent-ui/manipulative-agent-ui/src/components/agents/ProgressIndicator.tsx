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
    <div className="mt-3 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-text-muted uppercase tracking-wide font-medium">{title}</p>
        <span className="text-[10px] text-text-secondary">{completed}/{items.length}</span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-border mb-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${(completed / items.length) * 100}%` }}
        />
      </div>
      {/* Items list */}
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px]">
            {item.done ? (
              <Check size={11} className="text-success shrink-0" />
            ) : (
              <Loader2 size={11} className="text-warning shrink-0 animate-spin" />
            )}
            <span className={item.done ? 'text-text-secondary' : 'text-text-primary'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
