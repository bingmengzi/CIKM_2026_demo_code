import { Zap } from 'lucide-react'
import { activityPlans } from '@/mock/activity-plan'

export function ActivityPlanCard() {
  return (
    <div className="mt-3 space-y-2 animate-fade-in-up">
      <p className="text-[10px] text-text-muted uppercase tracking-wide font-medium">
        Designed Activities
      </p>
      {activityPlans.map((plan) => (
        <div
          key={plan.id}
          className="p-2.5 rounded-md border border-border bg-background/50"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
              {plan.id}
            </span>
            <span className="text-xs font-medium text-text-primary">{plan.title}</span>
            <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] bg-surface text-text-muted capitalize">
              {plan.interactionModel}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed ml-7">
            {plan.learningGoal}
          </p>
        </div>
      ))}
    </div>
  )
}
