interface AgentThinkingStreamProps {
  text: string
  isStreaming: boolean
}

export function AgentThinkingStream({ text, isStreaming }: AgentThinkingStreamProps) {
  if (!text) return null

  return (
    <div className="text-[14px] text-text-secondary leading-[1.7] whitespace-pre-wrap font-mono bg-background rounded-lg p-4 border border-border-light mt-3 max-h-[240px] overflow-y-auto">
      {text}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-accent rounded-sm ml-1 align-middle animate-typing-cursor" />
      )}
    </div>
  )
}
