import { useState } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function DesignTab() {
  const { agentStatuses, designImages, regenerateImage } = useOrchestration()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<Record<string, string>>({})
  const [regenerating, setRegenerating] = useState<string | null>(null)

  const isVisible = agentStatuses.design !== 'idle'

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm">
        Design mockups will appear when Instructional Design Agent runs
      </div>
    )
  }

  const images = Object.entries(designImages)

  if (images.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 size={16} className="animate-spin mr-2" />
        Generating design images...
      </div>
    )
  }

  const handleRegenerate = async (imageId: string) => {
    const prompt = prompts[imageId] || designImages[imageId]?.prompt || ''
    if (!prompt) return
    setRegenerating(imageId)
    await regenerateImage(imageId, prompt)
    setRegenerating(null)
    setEditingId(null)
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide">
        UI Design Mockups
      </h3>
      {images.map(([id, img]) => (
        <div key={id} className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="relative">
            <img
              src={img.url}
              alt={id}
              className="w-full h-auto object-cover"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium bg-background/80 text-text-primary">
              {id.replace('_', ' ')}
            </span>
            {regenerating === id && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="p-3">
            {editingId === id ? (
              <div className="space-y-2">
                <textarea
                  value={prompts[id] ?? img.prompt}
                  onChange={(e) => setPrompts({ ...prompts, [id]: e.target.value })}
                  className="w-full p-2 bg-background border border-border rounded text-xs text-text-primary resize-none outline-none focus:border-accent min-h-[60px]"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegenerate(id)}
                    disabled={regenerating !== null}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-accent/20 text-accent font-medium hover:bg-accent/30 transition-colors disabled:opacity-40"
                  >
                    <RefreshCw size={10} />
                    Regenerate
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 rounded text-[10px] text-text-muted hover:text-text-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-text-secondary line-clamp-2 flex-1">
                  {img.prompt}
                </p>
                <button
                  onClick={() => setEditingId(id)}
                  className="shrink-0 px-2 py-1 rounded text-[10px] text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
