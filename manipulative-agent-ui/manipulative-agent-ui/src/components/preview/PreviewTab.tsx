import { useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

const FALLBACK_URL = 'https://static0.xesimg.com/math-aigc/source_files/aied-baseline-eval/no_verification/20/index.html'

export function PreviewTab() {
  const { agentStatuses, currentIteration, previewUrl: dynamicUrl } = useOrchestration()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const isVisible = agentStatuses.engineer !== 'idle'

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-background border border-border flex items-center justify-center">
            <span className="text-2xl opacity-40">▶</span>
          </div>
          <p>Live preview will appear here</p>
          <p className="text-xs mt-1">after Engineering Agent generates code</p>
        </div>
      </div>
    )
  }

  const previewUrl = dynamicUrl || null

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
          <span className="text-xs text-text-secondary">
            {currentIteration > 0 ? `Iteration v${currentIteration}` : 'Generating...'}
          </span>
          {previewUrl && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <Maximize2 size={12} />
              Fullscreen
            </button>
          )}
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-hidden bg-background">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Manipulative Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted text-xs">
              <div className="text-center">
                <p>Preview URL not configured yet.</p>
                <p className="mt-1 text-text-muted">Provide a deployed URL to enable live preview.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors backdrop-blur"
          >
            <X size={16} />
            Close
          </button>
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Manipulative Preview Fullscreen"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </>
  )
}
