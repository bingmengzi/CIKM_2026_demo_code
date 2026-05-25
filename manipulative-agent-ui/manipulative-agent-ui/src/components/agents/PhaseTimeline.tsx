import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ResolvedPhase } from '@/lib/phases'
import type { AgentId } from '@/types'

interface ScenarioContext {
  topic: string
  gradeLevel: string
  standard: string
  learningObjective: string
  commonMisconception: string
}

interface PhaseTimelineProps {
  agentId: AgentId
  phases: ResolvedPhase[]
  accentColor: string
  accentTextClass: string
  accentBgClass: string
  scenario: ScenarioContext
}

function PhaseDots({ accentBgClass }: { accentBgClass: string }) {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className={cn('w-1 h-1 rounded-full animate-bounce-dot', accentBgClass)} style={{ animationDelay: '0ms' }} />
      <span className={cn('w-1 h-1 rounded-full animate-bounce-dot', accentBgClass)} style={{ animationDelay: '150ms' }} />
      <span className={cn('w-1 h-1 rounded-full animate-bounce-dot', accentBgClass)} style={{ animationDelay: '300ms' }} />
    </span>
  )
}

function ScanContextChips({ scenario, accentColor }: { scenario: ScenarioContext; accentColor: string }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold border bg-white"
          style={{ color: accentColor, borderColor: `${accentColor}40` }}
        >
          <span className="text-text-muted font-medium">Topic</span>
          {scenario.topic}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold border border-border-light bg-white text-text-secondary">
          <span className="text-text-muted font-medium">Grade</span>
          {scenario.gradeLevel}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border border-border-light bg-white text-text-muted">
          {scenario.standard}
        </span>
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed">
        <span className="font-semibold text-text-primary">Goal · </span>
        {scenario.learningObjective}
      </p>
    </div>
  )
}

function PhaseRow({
  phase,
  index,
  agentId,
  scenario,
  accentColor,
  accentTextClass,
  accentBgClass,
}: {
  phase: ResolvedPhase
  index: number
  agentId: AgentId
  scenario: ScenarioContext
  accentColor: string
  accentTextClass: string
  accentBgClass: string
}) {
  const isActive = phase.state === 'active'
  const isDone = phase.state === 'done'
  const isPending = phase.state === 'pending'

  const [manuallyToggled, setManuallyToggled] = useState<boolean | null>(null)
  const isScanPhase = agentId === 'science' && phase.kind === 'scan'
  const hasContextChips = isScanPhase && (isActive || isDone)
  const hasText = !!phase.text || hasContextChips
  const defaultExpanded = isActive || (isDone && hasText)
  const expanded = manuallyToggled ?? defaultExpanded

  return (
    <div
      className="relative animate-phase-row-in"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      <div className="flex items-start gap-3">
        {/* Marker column */}
        <div className="relative flex flex-col items-center pt-0.5">
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all',
              isDone && 'bg-success/90 text-white',
              isActive && 'bg-white shadow-sm ring-2',
              isPending && 'bg-border-light text-text-muted'
            )}
            style={isActive ? ({ borderColor: accentColor, boxShadow: `0 0 0 3px ${accentColor}1a` } as React.CSSProperties) : undefined}
          >
            {isDone ? (
              <Check size={11} strokeWidth={3} />
            ) : isActive ? (
              <span className={cn('w-2 h-2 rounded-full animate-pulse-dot', accentBgClass)} />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
        </div>

        {/* Body */}
        <button
          type="button"
          onClick={() => hasText && setManuallyToggled(!expanded)}
          className={cn(
            'flex-1 min-w-0 text-left transition-colors',
            hasText && 'cursor-pointer',
            !hasText && 'cursor-default'
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-[14px] font-semibold transition-colors',
                isActive && accentTextClass,
                isDone && 'text-text-primary',
                isPending && 'text-text-muted'
              )}
            >
              {phase.label}
            </span>
            {isActive && <PhaseDots accentBgClass={accentBgClass} />}
            {hasText && (
              <ChevronDown
                size={13}
                className={cn(
                  'ml-auto text-text-muted transition-transform duration-300',
                  expanded && 'rotate-180'
                )}
              />
            )}
          </div>

          {hasText && (
            <div
              className={cn(
                'overflow-hidden transition-[max-height,opacity,margin] duration-400 ease-out',
                expanded ? 'max-h-[400px] opacity-100 mt-2' : 'max-h-0 opacity-0'
              )}
            >
              <div
                className={cn(
                  'rounded-lg px-3.5 py-3 border max-h-[360px] overflow-y-auto',
                  isActive ? 'bg-surface-alt border-border-light' : 'bg-background/60 border-border-light/70'
                )}
              >
                {hasContextChips && (
                  <div className={cn(phase.text && 'mb-3 pb-3 border-b border-border-light')}>
                    <ScanContextChips scenario={scenario} accentColor={accentColor} />
                  </div>
                )}
                {phase.text && (
                  <div className="text-[13px] text-text-secondary leading-[1.65] whitespace-pre-wrap">
                    {phase.text}
                    {isActive && (
                      <span
                        className="inline-block w-1.5 h-3.5 rounded-sm ml-1 align-middle animate-typing-cursor"
                        style={{ background: accentColor }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Vertical connector to next row */}
      <div className="absolute left-[11px] top-7 bottom-[-12px] w-[2px]">
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            isDone ? 'bg-success/40' : 'bg-border-light'
          )}
        />
      </div>
    </div>
  )
}

export function PhaseTimeline({ agentId, phases, accentColor, accentTextClass, accentBgClass, scenario }: PhaseTimelineProps) {
  return (
    <div className="mt-1 space-y-3 pl-0.5">
      {phases.map((phase, idx) => (
        <PhaseRow
          key={phase.id}
          phase={phase}
          index={idx}
          agentId={agentId}
          scenario={scenario}
          accentColor={accentColor}
          accentTextClass={accentTextClass}
          accentBgClass={accentBgClass}
        />
      ))}
    </div>
  )
}
