import { Brain, Pencil, Code, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentStatusBadge } from './AgentStatusBadge'
import { AgentThinkingStream } from './AgentThinkingStream'
import { ActivityPlanCard } from './ActivityPlanCard'
import { ProgressIndicator } from './ProgressIndicator'
import { VerificationStatus } from './VerificationStatus'
import type { AgentId, AgentStatus } from '@/types'

const agentConfig: Record<AgentId, { name: string; color: string; borderColor: string; icon: React.ReactNode }> = {
  science: {
    name: 'Learning Science Agent',
    color: 'text-agent-science',
    borderColor: 'border-l-agent-science',
    icon: <Brain size={16} />,
  },
  design: {
    name: 'Instructional Design Agent',
    color: 'text-agent-design',
    borderColor: 'border-l-agent-design',
    icon: <Pencil size={16} />,
  },
  engineer: {
    name: 'Engineering Agent',
    color: 'text-agent-engineer',
    borderColor: 'border-l-agent-engineer',
    icon: <Code size={16} />,
  },
  test: {
    name: 'Testing Agent',
    color: 'text-agent-test',
    borderColor: 'border-l-agent-test',
    icon: <FlaskConical size={16} />,
  },
}

// Mock progress items for design agent
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

  if (status === 'idle') return null

  const showStructured = status === 'done' || status === 'awaiting_review'

  return (
    <div
      className={cn(
        'border-l-2 rounded-r-md bg-surface p-3 animate-fade-in-up',
        config.borderColor
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className={config.color}>{config.icon}</span>
        <span className={cn('text-xs font-medium', config.color)}>{config.name}</span>
        <AgentStatusBadge status={status} />
      </div>

      {/* Streaming content */}
      <AgentThinkingStream text={streamedText} isStreaming={isStreaming} />

      {/* Structured output after completion */}
      {showStructured && agentId === 'science' && <ActivityPlanCard />}
      {showStructured && agentId === 'design' && (
        <ProgressIndicator items={designProgress} title="Generated Assets" />
      )}
      {showStructured && agentId === 'engineer' && (
        <div className="mt-3 p-2 rounded-md bg-success/10 border border-success/20 animate-fade-in-up">
          <p className="text-[11px] text-success font-medium">
            Code generation complete — check Preview tab →
          </p>
        </div>
      )}
      {showStructured && agentId === 'test' && <VerificationStatus />}
    </div>
  )
}
