import { activityPlans } from '@/mock/activity-plan'

export function ActivityPlanCard() {
  return (
    <div className="mt-4 space-y-2.5">
      <p
        className="text-[12px] text-text-muted uppercase tracking-wide font-bold animate-fade-in-up"
        style={{ animationDelay: '0ms', animationFillMode: 'both' }}
      >
        Designed Activities
      </p>
      {activityPlans.map((plan, idx) => (
        <div
          key={plan.id}
          className="p-3 rounded-lg border border-border-light bg-surface-alt hover:border-accent/30 transition-colors animate-phase-row-in"
          style={{ animationDelay: `${120 + idx * 140}ms`, opacity: 0, animationFillMode: 'forwards' }}
        >
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-6 h-6 rounded-md bg-accent-light flex items-center justify-center text-[12px] font-bold text-accent">
              {plan.id}
            </span>
            <span className="text-[14px] font-semibold text-text-primary">{plan.title}</span>
            <span className="ml-auto px-2 py-0.5 rounded-md text-[11px] font-medium bg-background text-text-muted capitalize border border-border-light">
              {plan.interactionModel}
            </span>
          </div>
          <p className="text-[13px] text-text-secondary leading-relaxed ml-8">
            {plan.learningGoal}
          </p>
        </div>
      ))}
    </div>
  )
}
