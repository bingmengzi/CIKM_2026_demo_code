import { Check, X, Loader2 } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function VerifyTab() {
  const { agentStatuses, verificationResults } = useOrchestration()

  const isVisible = agentStatuses.test !== 'idle'

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-[14px]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-agent-test-bg flex items-center justify-center">
            <span className="text-2xl opacity-40">🧪</span>
          </div>
          <p className="font-medium">Verification results will appear here</p>
          <p className="text-[12px] text-text-muted mt-1">when Testing Agent runs</p>
        </div>
      </div>
    )
  }

  if (verificationResults.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-[14px]">
        <div className="flex items-center gap-2.5">
          <Loader2 size={18} className="animate-spin text-agent-test" />
          <span>Running automated verification...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wide">
        Automated Verification
      </h3>

      {verificationResults.map((result: any) => (
        <div key={result.activity_id} className="rounded-xl border border-border-light bg-surface-alt overflow-hidden shadow-sm animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-border-light">
            <span className="text-[15px] font-semibold text-text-primary">Activity {result.activity_id}</span>
            <span className={`text-[12px] font-bold px-3 py-1 rounded-lg ${result.passed ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>
              {result.passed ? 'PASSED' : 'FAILED'}
            </span>
          </div>

          {/* Screenshots */}
          <div className="p-3.5">
            {result.screenshot && (
              <div className="mb-3">
                <img src={result.screenshot} alt="Screenshot" className="w-full rounded-lg border border-border-light" />
              </div>
            )}

            {/* Checklist */}
            {result.checks && (
              <div className="space-y-2">
                {result.checks.map((check: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[14px]">
                    {check.passed ? (
                      <Check size={14} className="text-success shrink-0" strokeWidth={2.5} />
                    ) : (
                      <X size={14} className="text-error shrink-0" strokeWidth={2.5} />
                    )}
                    <span className={check.passed ? 'text-text-secondary' : 'text-error font-medium'}>
                      {check.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Fix description */}
            {result.fix_description && (
              <div className="mt-3 p-3 rounded-lg bg-warning-light border border-warning/20">
                <p className="text-[12px] font-bold text-warning mb-1">Auto-fix applied:</p>
                <p className="text-[12px] text-text-secondary leading-relaxed">{result.fix_description}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
