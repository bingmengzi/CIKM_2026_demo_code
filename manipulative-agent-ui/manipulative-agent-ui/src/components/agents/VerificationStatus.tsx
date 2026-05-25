import { Check, X, RotateCcw, Loader2 } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function VerificationStatus() {
  const { verificationResults } = useOrchestration()

  if (verificationResults.length === 0) {
    return (
      <div className="mt-4 flex items-center gap-2.5 text-text-muted text-[14px]">
        <Loader2 size={14} className="animate-spin text-accent" />
        Running verification...
      </div>
    )
  }

  const passedCount = verificationResults.filter((r: any) => r.passed).length
  const totalCount = verificationResults.length

  return (
    <div className="mt-4 animate-fade-in-up">
      <p className="text-[12px] text-text-muted uppercase tracking-wide font-bold mb-3">
        Verification Results
      </p>
      <div className="space-y-2">
        {verificationResults.map((result: any, idx: number) => (
          <div
            key={result.activity_id}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-alt border border-border-light animate-phase-row-in"
            style={{ animationDelay: `${idx * 120}ms`, opacity: 0, animationFillMode: 'forwards' }}
          >
            {result.passed ? (
              <Check size={15} className="text-success shrink-0" strokeWidth={2.5} />
            ) : (
              <X size={15} className="text-error shrink-0" strokeWidth={2.5} />
            )}
            <span className="text-[14px] text-text-primary font-medium flex-1">Activity {result.activity_id}</span>
            {result.fix_description && (
              <span className="flex items-center gap-1 text-[11px] text-warning font-medium">
                <RotateCcw size={11} />
                Fixed
              </span>
            )}
            {result.checks && (
              <span className={`text-[12px] font-bold ${result.passed ? 'text-success' : 'text-error'}`}>
                {result.checks.filter((c: any) => c.passed).length}/{result.checks.length}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-center">
        <span className={`text-[14px] font-bold ${passedCount === totalCount ? 'text-success' : 'text-warning'}`}>
          {passedCount}/{totalCount} activities passed
        </span>
      </div>
    </div>
  )
}
