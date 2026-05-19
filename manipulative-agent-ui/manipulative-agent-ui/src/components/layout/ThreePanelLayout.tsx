import { Group, Panel, Separator } from 'react-resizable-panels'
import { RotateCcw } from 'lucide-react'
import { LeftSidebar } from './LeftSidebar'
import { CenterWorkspace } from './CenterWorkspace'
import { RightPreview } from './RightPreview'
import { useOrchestration } from '@/hooks/useAgentOrchestration'

export function ThreePanelLayout() {
  const { isRunning, phase, resetDemo } = useOrchestration()

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-12 flex items-center px-4 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="font-semibold text-sm text-text-primary">ManipulativeAgent</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-text-muted mr-2">Multi-Agent Workbench</span>
          {(isRunning || phase === 'complete') && (
            <button
              onClick={resetDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface hover:bg-surface-hover text-text-secondary text-xs font-medium transition-colors border border-border"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Main panels */}
      <Group direction="horizontal" className="flex-1">
        <Panel defaultSize={18} minSize={14} maxSize={25}>
          <LeftSidebar />
        </Panel>

        <Separator className="w-[1px] bg-border hover:bg-accent transition-colors" />

        <Panel defaultSize={47} minSize={35}>
          <CenterWorkspace />
        </Panel>

        <Separator className="w-[1px] bg-border hover:bg-accent transition-colors" />

        <Panel defaultSize={35} minSize={25}>
          <RightPreview />
        </Panel>
      </Group>
    </div>
  )
}
