import { cn } from '@/lib/utils'
import type { CodeIteration } from '@/types'

interface CodeIterationTabsProps {
  iterations: CodeIteration[]
  selected: number
  maxAvailable: number
  onSelect: (index: number) => void
}

export function CodeIterationTabs({ iterations, selected, maxAvailable, onSelect }: CodeIterationTabsProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface/50">
      <span className="text-xs text-text-muted mr-2">Comparing:</span>
      {iterations.slice(0, maxAvailable + 1).map((iter, idx) => {
        if (idx >= maxAvailable) return null
        return (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium transition-colors',
              selected === idx
                ? 'bg-accent text-white'
                : 'bg-surface hover:bg-surface-hover text-text-secondary'
            )}
          >
            {iter.label} → {iterations[idx + 1]?.label || ''}
          </button>
        )
      })}
    </div>
  )
}
