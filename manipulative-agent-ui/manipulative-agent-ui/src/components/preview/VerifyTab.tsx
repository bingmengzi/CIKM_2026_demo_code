import { Check, X, ArrowRight, Loader2 } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function VerifyTab() {
  const { agentStatuses, verificationResults } = useOrchestration()

  const isVisible = agentStatuses.test !== 'idle'

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm">
        Verification results will appear when Testing Agent runs
      </div>
    )
  }

  if (verificationResults.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 size={16} className="animate-spin mr-2" />
        Running automated verification...
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide">
        Automated Verification
      </h3>

      {verificationResults.map((result: any) => (
        <div key={result.activity_id} className="rounded-lg border border-border bg-surface overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <span className="text-xs font-medium text-text-primary">Activity {result.activity_id}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${result.passed ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
              {result.passed ? 'PASSED' : 'FAILED'}
            </span>
          </div>

          {/* Screenshots */}
          <div className="p-3">
            {result.screenshot && (
              <div className="mb-3">
                <img src={result.screenshot} alt="Screenshot" className="w-full rounded border border-border" />
              </div>
            )}

            {/* Checklist */}
            {result.checks && (
              <div className="space-y-1">
                {result.checks.map((check: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    {check.passed ? (
                      <Check size={12} className="text-success shrink-0" />
                    ) : (
                      <X size={12} className="text-error shrink-0" />
                    )}
                    <span className={check.passed ? 'text-text-secondary' : 'text-error'}>
                      {check.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Fix description */}
            {result.fix_description && (
              <div className="mt-2 p-2 rounded bg-warning/10 border border-warning/20">
                <p className="text-[10px] font-medium text-warning mb-0.5">Auto-fix applied:</p>
                <p className="text-[10px] text-text-secondary">{result.fix_description}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
