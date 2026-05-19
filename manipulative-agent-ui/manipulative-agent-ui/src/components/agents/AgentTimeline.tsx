import { useOrchestration } from '@/hooks/useAgentOrchestration'
import { AgentCard } from './AgentCard'
import { InputBar } from './InputBar'
import { ReviewPanel } from './ReviewPanel'
import type { AgentId } from '@/types'

const agentOrder: AgentId[] = ['science', 'design', 'engineer', 'test']

export function AgentTimeline() {
  const { agentStatuses, streamedTexts, activeAgent, phase, userInput } = useOrchestration()

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Input phase: show text area */}
        {phase === 'input' && <InputBar />}

        {/* Show user input as a message once submitted */}
        {userInput && phase !== 'input' && (
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-accent">U</span>
              </div>
              <span className="text-xs font-medium text-accent">Teacher Input</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{userInput}</p>
          </div>
        )}

        {/* Agent cards */}
        {agentOrder.map((agentId) => (
          <AgentCard
            key={agentId}
            agentId={agentId}
            status={agentStatuses[agentId]}
            streamedText={streamedTexts[agentId]}
            isStreaming={activeAgent === agentId && agentStatuses[agentId] === 'thinking'}
          />
        ))}

        {/* Review panel - HITL checkpoint */}
        <ReviewPanel />

        {/* Complete state */}
        {phase === 'complete' && (
          <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-center animate-fade-in-up">
            <p className="text-xs font-medium text-success">
              All agents completed. Interactive manipulative generated successfully.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
