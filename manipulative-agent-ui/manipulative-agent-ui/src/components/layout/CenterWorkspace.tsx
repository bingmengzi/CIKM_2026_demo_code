import { AgentTimeline } from '../agents/AgentTimeline'

export function CenterWorkspace() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-10 flex items-center px-4 border-b border-border shrink-0">
        <span className="text-xs font-medium text-text-secondary">Agent Workspace</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AgentTimeline />
      </div>
    </div>
  )
}
