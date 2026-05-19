import { cn } from '@/lib/utils'

interface AgentThinkingStreamProps {
  text: string
  isStreaming: boolean
}

export function AgentThinkingStream({ text, isStreaming }: AgentThinkingStreamProps) {
  if (!text) return null

  return (
    <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-mono">
      {text}
      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 bg-text-primary ml-0.5 -mb-0.5 animate-typing-cursor" />
      )}
    </div>
  )
}
