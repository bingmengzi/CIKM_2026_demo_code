import { Check, X, RotateCcw, Loader2 } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function VerificationStatus() {
  const { verificationResults } = useOrchestration()

  if (verificationResults.length === 0) {
    return (
      <div className="mt-3 flex items-center gap-2 text-text-muted text-[11px]">
        <Loader2 size={12} className="animate-spin" />
        Running verification...
      </div>
    )
  }

  const passedCount = verificationResults.filter((r: any) => r.passed).length
  const totalCount = verificationResults.length

  return (
    <div className="mt-3 animate-fade-in-up">
      <p className="text-[10px] text-text-muted uppercase tracking-wide font-medium mb-2">
        Verification Results
      </p>
      <div className="space-y-1.5">
        {verificationResults.map((result: any) => (
          <div
            key={result.activity_id}
            className="flex items-center gap-2 p-2 rounded-md bg-background/50 border border-border"
          >
            {result.passed ? (
              <Check size={13} className="text-success shrink-0" />
            ) : (
              <X size={13} className="text-error shrink-0" />
            )}
            <span className="text-xs text-text-primary flex-1">Activity {result.activity_id}</span>
            {result.fix_description && (
              <span className="flex items-center gap-1 text-[10px] text-warning">
                <RotateCcw size={10} />
                Fixed
              </span>
            )}
            {result.checks && (
              <span className={`text-[10px] font-medium ${result.passed ? 'text-success' : 'text-error'}`}>
                {result.checks.filter((c: any) => c.passed).length}/{result.checks.length}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 text-center">
        <span className={`text-[10px] font-medium ${passedCount === totalCount ? 'text-success' : 'text-warning'}`}>
          {passedCount}/{totalCount} activities passed
        </span>
      </div>
    </div>
  )
}
