import { useState } from 'react'
import { Send } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function InputBar() {
  const { submitInput, phase } = useOrchestration()
  const [input, setInput] = useState(
    'Generate an interactive fraction comparison manipulative for Grade 3-4 students. Should support bar model and pie model with adjustable numerator/denominator.'
  )

  const handleSubmit = () => {
    if (!input.trim()) return
    submitInput(input.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (phase !== 'input') return null

  return (
    <div className="p-4">
      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the interactive manipulative you want to generate..."
          className="w-full p-3 bg-transparent text-sm text-text-primary placeholder-text-muted resize-none outline-none min-h-[80px]"
          rows={3}
        />
        <div className="flex items-center justify-between px-3 py-2 border-t border-border">
          <span className="text-xs text-text-muted">
            Press Enter to submit, Shift+Enter for new line
          </span>
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            <Send size={12} />
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}
