import { Brain, Pencil, Code, FlaskConical } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'
import { AgentStatusBadge } from '../agents/AgentStatusBadge'
import type { AgentId } from '@/types'

const agents: { id: AgentId; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'science', name: 'Learning Science', icon: <Brain size={16} />, color: 'text-agent-science' },
  { id: 'design', name: 'Instructional Design', icon: <Pencil size={16} />, color: 'text-agent-design' },
  { id: 'engineer', name: 'Engineering', icon: <Code size={16} />, color: 'text-agent-engineer' },
  { id: 'test', name: 'Testing', icon: <FlaskConical size={16} />, color: 'text-agent-test' },
]

export function LeftSidebar() {
  const { agentStatuses, scenario } = useOrchestration()

  return (
    <div className="h-full bg-surface border-r border-border flex flex-col">
      {/* Scenario info */}
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
          Scenario
        </h3>
        <p className="text-sm font-medium text-text-primary">{scenario.topic}</p>
        <p className="text-xs text-text-secondary mt-1">{scenario.gradeLevel}</p>
      </div>

      {/* Agent list */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">
          Agents
        </h3>
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-2 p-2 rounded-md bg-background/50 hover:bg-surface-hover transition-colors"
            >
              <span className={agent.color}>{agent.icon}</span>
              <span className="text-xs text-text-primary flex-1 truncate">{agent.name}</span>
              <AgentStatusBadge status={agentStatuses[agent.id]} />
            </div>
          ))}
        </div>
      </div>

      {/* Learning objective */}
      <div className="p-4 border-t border-border">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
          Objective
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {scenario.learningObjective}
        </p>
      </div>
    </div>
  )
}
