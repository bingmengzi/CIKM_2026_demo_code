import { cn } from '@/lib/utils'
import { AgentStatusBadge } from './AgentStatusBadge'
import { AgentIconAnimated } from './AgentIconAnimated'
import { PhaseTimeline } from './PhaseTimeline'
import { ActivityPlanCard } from './ActivityPlanCard'
import { ProgressIndicator } from './ProgressIndicator'
import { VerificationStatus } from './VerificationStatus'
import { FeedbackBubble } from './FeedbackBubble'
import { computePhases, activePhase } from '@/lib/phases'
import { useOrchestration } from '@/hooks/useAgentOrchestration'
import type { AgentId, AgentStatus } from '@/types'

const agentConfig: Record<AgentId, {
  name: string
  color: string
  bgTint: string
  borderColor: string
  iconUrl: string
  hex: string
  glowStrong: string
  bgColor: string
}> = {
  science: {
    name: 'Learning Science Agent',
    color: 'text-agent-science',
    bgTint: 'bg-agent-science-bg',
    borderColor: 'border-l-agent-science',
    iconUrl: '/agents/science.png',
    hex: '#7c3aed',
    glowStrong: 'rgba(124, 58, 237, 0.32)',
    bgColor: 'bg-agent-science',
  },
  design: {
    name: 'Instructional Design Agent',
    color: 'text-agent-design',
    bgTint: 'bg-agent-design-bg',
    borderColor: 'border-l-agent-design',
    iconUrl: '/agents/design.png',
    hex: '#2563eb',
    glowStrong: 'rgba(37, 99, 235, 0.32)',
    bgColor: 'bg-agent-design',
  },
  engineer: {
    name: 'Engineering Agent',
    color: 'text-agent-engineer',
    bgTint: 'bg-agent-engineer-bg',
    borderColor: 'border-l-agent-engineer',
    iconUrl: '/agents/engineer.png',
    hex: '#059669',
    glowStrong: 'rgba(5, 150, 105, 0.32)',
    bgColor: 'bg-agent-engineer',
  },
  test: {
    name: 'Testing Agent',
    color: 'text-agent-test',
    bgTint: 'bg-agent-test-bg',
    borderColor: 'border-l-agent-test',
    iconUrl: '/agents/test.png',
    hex: '#ea580c',
    glowStrong: 'rgba(234, 88, 12, 0.32)',
    bgColor: 'bg-agent-test',
  },
}

const designProgress = [
  { label: 'Home page design', done: true },
  { label: 'Activity 1 design', done: true },
  { label: 'Activity 2 design', done: true },
  { label: 'Activity 3 design', done: true },
  { label: 'Background assets (3)', done: true },
  { label: 'Interactive assets (3)', done: true },
  { label: 'Static assets (4)', done: true },
]

interface AgentCardProps {
  agentId: AgentId
  status: AgentStatus
  streamedText: string
  isStreaming: boolean
}

export function AgentCard({ agentId, status, streamedText, isStreaming }: AgentCardProps) {
  const config = agentConfig[agentId]
  const { scenario, feedbacks } = useOrchestration()

  if (status === 'idle') return null

  const showStructured = status === 'done' || status === 'awaiting_review'
  const isActive = status === 'thinking' || status === 'awaiting_review'

  const phases = computePhases(agentId, streamedText, status)
  const current = activePhase(phases)

  const agentFeedbacks = feedbacks[agentId]
  const isRegenerating = agentFeedbacks.length > 0 && status === 'thinking'

  return (
    <div
      className={cn(
        'border-l-[3px] rounded-xl bg-white p-5 animate-slide-in-left transition-all duration-400',
        config.borderColor,
        isActive && 'shadow-md',
        status === 'done' && 'shadow-sm'
      )}
    >
      {/* Header — clean: icon, name, status only */}
      <div className="flex items-center gap-3 mb-4">
        <AgentIconAnimated
          iconUrl={config.iconUrl}
          alt={config.name}
          size="sm"
          isActive={isActive}
          isDone={status === 'done'}
          phaseKind={current?.kind}
          accentColor={config.hex}
          glowStrong={config.glowStrong}
        />
        <span className={cn('text-[15.5px] font-bold tracking-tight', config.color)}>
          {config.name}
        </span>
        <div className="ml-auto">
          <AgentStatusBadge status={status} />
        </div>
      </div>

      {/* Phase timeline */}
      <PhaseTimeline
        agentId={agentId}
        phases={phases}
        accentColor={config.hex}
        accentTextClass={config.color}
        accentBgClass={config.bgColor}
        scenario={scenario}
      />

      {/* Teacher feedback bubble(s) */}
      <FeedbackBubble
        feedbacks={agentFeedbacks}
        isRegenerating={isRegenerating}
        accentColor={config.hex}
      />

      {/* Optional raw streaming fallback if no segments matched yet */}
      {isStreaming && phases.every((p) => p.text === '') && streamedText && (
        <div className="mt-3 text-[13px] text-text-secondary leading-[1.7] whitespace-pre-wrap font-mono bg-background rounded-lg p-3 border border-border-light max-h-[180px] overflow-y-auto">
          {streamedText}
          <span
            className="inline-block w-1.5 h-3.5 rounded-sm ml-1 align-middle animate-typing-cursor"
            style={{ background: config.hex }}
          />
        </div>
      )}

      {/* Structured output after completion */}
      {showStructured && agentId === 'science' && <ActivityPlanCard />}
      {showStructured && agentId === 'design' && (
        <ProgressIndicator items={designProgress} title="Generated Assets" />
      )}
      {showStructured && agentId === 'engineer' && (
        <div className="mt-4 p-3.5 rounded-lg bg-success-light border border-success/20 animate-fade-in-up">
          <p className="text-[13px] text-success font-semibold">
            Code generation complete — check Preview tab →
          </p>
        </div>
      )}
      {showStructured && agentId === 'test' && <VerificationStatus />}
    </div>
  )
}
