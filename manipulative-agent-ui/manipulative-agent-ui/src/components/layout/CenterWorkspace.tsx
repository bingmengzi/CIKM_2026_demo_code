import { AgentTimeline } from '../agents/AgentTimeline'

export function CenterWorkspace() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-11 flex items-center px-5 border-b border-border shrink-0 bg-white">
        <span className="text-[14px] font-semibold text-text-secondary">Agent Workspace</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AgentTimeline />
      </div>
    </div>
  )
}
