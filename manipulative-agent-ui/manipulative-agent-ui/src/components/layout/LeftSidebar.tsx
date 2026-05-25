import { Check } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'
import { cn } from '@/lib/utils'
import { AgentIconAnimated } from '../agents/AgentIconAnimated'
import { computePhases, activePhase } from '@/lib/phases'
import type { AgentId, AgentStatus } from '@/types'

type AgentMeta = {
  id: AgentId
  name: string
  role: string
  iconUrl: string
  color: string
  bgColor: string
  bgTint: string
  borderTint: string
  ringColor: string
  glow: string
  glowStrong: string
  hex: string
}

const agents: AgentMeta[] = [
  {
    id: 'science',
    name: 'Learning Science',
    role: 'Plans activities',
    iconUrl: '/agents/science.png',
    color: 'text-agent-science',
    bgColor: 'bg-agent-science',
    bgTint: 'bg-agent-science-bg',
    borderTint: 'border-agent-science-border',
    ringColor: 'ring-agent-science/40',
    glow: 'rgba(124, 58, 237, 0.18)',
    glowStrong: 'rgba(124, 58, 237, 0.32)',
    hex: '#7c3aed',
  },
  {
    id: 'design',
    name: 'Instructional Design',
    role: 'Designs UI & assets',
    iconUrl: '/agents/design.png',
    color: 'text-agent-design',
    bgColor: 'bg-agent-design',
    bgTint: 'bg-agent-design-bg',
    borderTint: 'border-agent-design-border',
    ringColor: 'ring-agent-design/40',
    glow: 'rgba(37, 99, 235, 0.18)',
    glowStrong: 'rgba(37, 99, 235, 0.32)',
    hex: '#2563eb',
  },
  {
    id: 'engineer',
    name: 'Engineering',
    role: 'Writes HTML code',
    iconUrl: '/agents/engineer.png',
    color: 'text-agent-engineer',
    bgColor: 'bg-agent-engineer',
    bgTint: 'bg-agent-engineer-bg',
    borderTint: 'border-agent-engineer-border',
    ringColor: 'ring-agent-engineer/40',
    glow: 'rgba(5, 150, 105, 0.18)',
    glowStrong: 'rgba(5, 150, 105, 0.32)',
    hex: '#059669',
  },
  {
    id: 'test',
    name: 'Testing',
    role: 'Verifies the result',
    iconUrl: '/agents/test.png',
    color: 'text-agent-test',
    bgColor: 'bg-agent-test',
    bgTint: 'bg-agent-test-bg',
    borderTint: 'border-agent-test-border',
    ringColor: 'ring-agent-test/40',
    glow: 'rgba(234, 88, 12, 0.18)',
    glowStrong: 'rgba(234, 88, 12, 0.32)',
    hex: '#ea580c',
  },
]

function ThinkingDots({ bgColor }: { bgColor: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={cn('w-1.5 h-1.5 rounded-full animate-bounce-dot', bgColor)} style={{ animationDelay: '0ms' }} />
      <span className={cn('w-1.5 h-1.5 rounded-full animate-bounce-dot', bgColor)} style={{ animationDelay: '150ms' }} />
      <span className={cn('w-1.5 h-1.5 rounded-full animate-bounce-dot', bgColor)} style={{ animationDelay: '300ms' }} />
    </div>
  )
}

function StatusLabel({ status, agent, currentPhaseLabel }: {
  status: AgentStatus
  agent: AgentMeta
  currentPhaseLabel?: string
}) {
  if (status === 'thinking') {
    return (
      <div className="flex flex-col gap-0.5">
        <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider', agent.color)}>
          <ThinkingDots bgColor={agent.bgColor} />
          Thinking
        </span>
        {currentPhaseLabel && (
          <span className="text-[11px] font-medium text-text-secondary truncate">
            {currentPhaseLabel}
          </span>
        )}
      </div>
    )
  }
  if (status === 'awaiting_review') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-warning">
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-warning animate-ping-soft" />
          <span className="relative w-2 h-2 rounded-full bg-warning" />
        </span>
        Review
      </span>
    )
  }
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-success">
        <Check size={11} strokeWidth={3} />
        Done
      </span>
    )
  }
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted/70">
      Waiting
    </span>
  )
}

function FlowConnector({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className="relative ml-[26px] h-5 w-[2px] my-0.5">
      <div className={cn(
        'absolute inset-0 rounded-full transition-colors duration-500',
        done ? 'bg-success/40' : 'bg-border-light'
      )} />
      {active && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            className="absolute left-0 right-0 h-3 bg-gradient-to-b from-transparent via-accent to-transparent animate-data-flow"
          />
        </div>
      )}
    </div>
  )
}

export function LeftSidebar() {
  const { agentStatuses, streamedTexts, scenario } = useOrchestration()

  return (
    <div className="h-full bg-white border-r border-border flex flex-col overflow-hidden">
      {/* Scenario info */}
      <div className="px-6 py-4 border-b border-border shrink-0">
        <h3 className="text-[11px] font-bold text-accent uppercase tracking-widest mb-1.5">
          Scenario
        </h3>
        <p className="text-[16px] font-bold text-text-primary leading-snug">{scenario.topic}</p>
        <p className="text-[12px] text-text-secondary mt-0.5">{scenario.gradeLevel}</p>
      </div>

      {/* Agent list */}
      <div className="px-5 pt-4 pb-2 shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
            Agents
          </h3>
          <span className="text-[11px] font-semibold text-text-muted/70">
            {Object.values(agentStatuses).filter((s) => s === 'done').length}/{agents.length}
          </span>
        </div>

        <div className="flex flex-col">
          {agents.map((agent, idx) => {
            const status = agentStatuses[agent.id]
            const isActive = status === 'thinking' || status === 'awaiting_review'
            const isDone = status === 'done'
            const isIdle = status === 'idle'
            const nextStatus = idx < agents.length - 1 ? agentStatuses[agents[idx + 1].id] : undefined
            const flowActive = isDone && nextStatus && nextStatus !== 'idle'

            const phases = computePhases(agent.id, streamedTexts[agent.id] || '', status)
            const current = activePhase(phases)
            const currentLabel = isActive ? current?.label : undefined

            return (
              <div key={agent.id}>
                <div
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-400 overflow-hidden',
                    isActive && `${agent.bgTint} ${agent.borderTint} shadow-sm animate-agent-glow`,
                    isDone && 'bg-success-light border-success-border/60',
                    isIdle && 'bg-background/50 border-transparent'
                  )}
                  style={
                    isActive
                      ? ({
                          ['--glow-color' as string]: agent.glow,
                          ['--glow-color-strong' as string]: agent.glowStrong,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  {/* Shimmer sweep when active */}
                  {isActive && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                      <div className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer-sweep" />
                    </div>
                  )}

                  {/* Phase-aware animated icon */}
                  <AgentIconAnimated
                    iconUrl={agent.iconUrl}
                    alt={agent.name}
                    size="md"
                    isActive={isActive}
                    isDone={isDone}
                    phaseKind={current?.kind}
                    accentColor={agent.hex}
                    glowStrong={agent.glowStrong}
                  />

                  {/* Name & role */}
                  <div className="flex-1 min-w-0 relative">
                    <div
                      className={cn(
                        'text-[14px] font-bold leading-tight truncate transition-colors duration-300',
                        isActive && 'text-text-primary',
                        isDone && 'text-text-primary',
                        isIdle && 'text-text-muted'
                      )}
                    >
                      {agent.name}
                    </div>
                    <div className="mt-0.5">
                      <StatusLabel status={status} agent={agent} currentPhaseLabel={currentLabel} />
                    </div>
                  </div>
                </div>

                {/* Flow connector to next agent */}
                {idx < agents.length - 1 && (
                  <FlowConnector active={!!flowActive} done={isDone} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Learning objective */}
      <div className="px-6 py-4 border-t border-border shrink-0">
        <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
          Objective
        </h3>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          {scenario.learningObjective}
        </p>
      </div>
    </div>
  )
}
