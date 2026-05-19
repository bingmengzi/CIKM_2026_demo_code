import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'
import { useOrchestration } from '@/hooks/useAgentOrchestration'
import { codeIterations } from '@/mock/code-iterations'
import { CodeIterationTabs } from './CodeIterationTabs'
import { useState } from 'react'

export function CodeDiffViewer() {
  const { currentIteration } = useOrchestration()
  const [selectedDiff, setSelectedDiff] = useState(0)

  // Determine which versions to compare
  const leftIdx = selectedDiff
  const rightIdx = Math.min(selectedDiff + 1, codeIterations.length - 1)

  const hasContent = currentIteration > 0

  if (!hasContent) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm">
        Code diff will appear after Engineering Agent generates code
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <CodeIterationTabs
        iterations={codeIterations}
        selected={selectedDiff}
        maxAvailable={currentIteration}
        onSelect={setSelectedDiff}
      />
      <div className="flex-1 overflow-auto text-xs">
        <ReactDiffViewer
          oldValue={codeIterations[leftIdx]?.code || ''}
          newValue={codeIterations[rightIdx]?.code || ''}
          splitView={false}
          compareMethod={DiffMethod.LINES}
          useDarkTheme={true}
          styles={{
            variables: {
              dark: {
                diffViewerBackground: '#1a1d27',
                addedBackground: '#1a3a2a',
                removedBackground: '#3a1a1a',
                wordAddedBackground: '#2a5a3a',
                wordRemovedBackground: '#5a2a2a',
                addedGutterBackground: '#1a3a2a',
                removedGutterBackground: '#3a1a1a',
                gutterBackground: '#1a1d27',
                gutterColor: '#6b7280',
                codeFoldBackground: '#222633',
                codeFoldGutterBackground: '#222633',
              },
            },
            contentText: {
              fontSize: '12px',
              lineHeight: '1.5',
            },
          }}
        />
      </div>
    </div>
  )
}
