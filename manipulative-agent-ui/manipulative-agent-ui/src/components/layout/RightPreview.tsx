import { useState, useEffect } from 'react'
import { Paintbrush, ImageIcon, Eye, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrchestration } from '@/hooks/useAgentOrchestration'
import { DesignTab } from '../preview/DesignTab'
import { AssetsTab } from '../preview/AssetsTab'
import { PreviewTab } from '../preview/PreviewTab'
import { VerifyTab } from '../preview/VerifyTab'
import type { PreviewTab as PreviewTabType, AgentId } from '@/types'

const tabs: { id: PreviewTabType; label: string; icon: React.ReactNode; relatedAgent: AgentId }[] = [
  { id: 'design', label: 'Design', icon: <Paintbrush size={14} />, relatedAgent: 'design' },
  { id: 'assets', label: 'Assets', icon: <ImageIcon size={14} />, relatedAgent: 'design' },
  { id: 'preview', label: 'Preview', icon: <Eye size={14} />, relatedAgent: 'engineer' },
  { id: 'verify', label: 'Verify', icon: <ShieldCheck size={14} />, relatedAgent: 'test' },
]

export function RightPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTabType>('design')
  const { activeAgent, agentStatuses } = useOrchestration()
  const [flashTab, setFlashTab] = useState<PreviewTabType | null>(null)

  useEffect(() => {
    let nextTab: PreviewTabType | null = null
    if (activeAgent === 'design' || agentStatuses.design === 'awaiting_review') {
      nextTab = 'design'
    } else if (activeAgent === 'engineer' || agentStatuses.engineer === 'awaiting_review') {
      nextTab = 'preview'
    } else if (activeAgent === 'test') {
      nextTab = 'verify'
    }

    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab)
      setFlashTab(nextTab)
      const timer = setTimeout(() => setFlashTab(null), 800)
      return () => clearTimeout(timer)
    }
  }, [activeAgent, agentStatuses.design, agentStatuses.engineer])

  return (
    <div className="h-full flex flex-col bg-white border-l border-border">
      {/* Tab bar */}
      <div className="h-11 flex items-center px-3 border-b border-border shrink-0 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-semibold transition-all duration-200',
              activeTab === tab.id
                ? 'bg-accent-light text-accent shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-background',
              flashTab === tab.id && 'animate-tab-flash'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'design' && <DesignTab />}
        {activeTab === 'assets' && <AssetsTab />}
        {activeTab === 'preview' && <PreviewTab />}
        {activeTab === 'verify' && <VerifyTab />}
      </div>
    </div>
  )
}
