import { MessageSquare, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackBubbleProps {
  feedbacks: string[]
  isRegenerating: boolean
  accentColor: string
}

export function FeedbackBubble({ feedbacks, isRegenerating, accentColor }: FeedbackBubbleProps) {
  if (feedbacks.length === 0) return null

  return (
    <div className="mt-4 space-y-2 animate-fade-in-up">
      {feedbacks.map((fb, idx) => {
        const isLatest = idx === feedbacks.length - 1
        const showRegen = isLatest && isRegenerating
        return (
          <div
            key={idx}
            className={cn(
              'rounded-xl border bg-warning-light/60 px-4 py-3',
              showRegen && 'animate-generating-border'
            )}
            style={
              showRegen
                ? ({
                    ['--gen-border' as string]: `${accentColor}40`,
                    ['--gen-border-strong' as string]: `${accentColor}90`,
                  } as React.CSSProperties)
                : { borderColor: 'var(--color-warning)' + '30' }
            }
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-warning/15 flex items-center justify-center">
                <MessageSquare size={11} className="text-warning" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-warning">
                Teacher Feedback
              </span>
              {feedbacks.length > 1 && (
                <span className="text-[10px] font-semibold text-text-muted">
                  Round {idx + 1}
                </span>
              )}
            </div>
            <p className="text-[13px] text-text-primary leading-relaxed pl-7">
              "{fb}"
            </p>
            {showRegen && (
              <div
                className="mt-2.5 pl-7 flex items-center gap-2 text-[12px] font-semibold animate-feedback-regen"
                style={{ color: accentColor }}
              >
                <Sparkles size={12} className="animate-pulse" />
                <span>Regenerating from feedback…</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
