import { useState } from 'react'
import { RefreshCw, X, Loader2 } from 'lucide-react'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function AssetsTab() {
  const { agentStatuses, assets, regenerateImage } = useOrchestration()
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const isVisible = agentStatuses.design === 'done' || agentStatuses.design === 'awaiting_review'

  if (!isVisible) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm">
        Assets will appear after design generation completes
      </div>
    )
  }

  const assetEntries = Object.entries(assets)

  if (assetEntries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 size={16} className="animate-spin mr-2" />
        Generating assets...
      </div>
    )
  }

  // Group by activity
  const grouped = [1, 2, 3].map((actId) => ({
    activityId: actId,
    items: assetEntries.filter(([_, a]) => a.activity_id === actId),
  })).filter((g) => g.items.length > 0)

  const selectedAsset = selectedAssetId ? assets[selectedAssetId] : null

  const handleRegenerate = async () => {
    if (!selectedAssetId || !editPrompt.trim()) return
    setRegenerating(true)
    await regenerateImage(selectedAssetId, editPrompt.trim())
    setRegenerating(false)
    setSelectedAssetId(null)
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide">
        Generated Assets
      </h3>

      {grouped.map((group) => (
        <div key={group.activityId}>
          <h4 className="text-xs font-medium text-text-secondary mb-2">
            Activity {group.activityId}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {group.items.map(([id, asset]) => (
              <div
                key={id}
                onClick={() => { setSelectedAssetId(id); setEditPrompt(asset.prompt) }}
                className="rounded-md border border-border overflow-hidden cursor-pointer hover:border-accent/50 transition-colors"
              >
                <img src={asset.url} alt={asset.name} className="w-full h-16 object-cover" />
                <div className="p-1.5">
                  <p className="text-[10px] text-text-secondary truncate">{asset.name}</p>
                  <span className="text-[9px] text-text-muted capitalize">{asset.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Asset detail modal */}
      {selectedAsset && selectedAssetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedAssetId(null)}>
          <div className="bg-surface rounded-lg border border-border p-4 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-text-primary">{selectedAsset.name}</h4>
              <button onClick={() => setSelectedAssetId(null)} className="text-text-muted hover:text-text-primary">
                <X size={16} />
              </button>
            </div>
            <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full h-40 object-cover rounded-md mb-3" />
            <label className="text-xs text-text-muted block mb-1">Generation Prompt:</label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full p-2 bg-background border border-border rounded text-xs text-text-primary resize-none outline-none focus:border-accent min-h-[60px] mb-2"
              rows={3}
            />
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/20 text-accent text-xs font-medium hover:bg-accent/30 transition-colors disabled:opacity-40"
            >
              {regenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Regenerate Asset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
