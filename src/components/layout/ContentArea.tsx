import {Panel, Group, Separator} from 'react-resizable-panels';
import {Loader2, Code} from 'lucide-react';
import {QueryEditor} from '@/components/editor/QueryEditor';
import {EditorToolbar} from '@/components/editor/EditorToolbar';
import {ResultsPanel} from '@/components/results/ResultsPanel';
import {useEditorStore} from '@/store/editorStore';
import {useUIStore} from '@/store/uiStore';
import type {QueryResult} from '@/types';

interface ContentAreaProps {
  isRunning: boolean;
  result: QueryResult | null;
  onRun: () => void;
  isReady: boolean;
  isLoading?: boolean;
}

export function ContentArea({isRunning, result, onRun, isReady, isLoading}: ContentAreaProps) {
  const {content, setContent} = useEditorStore();
  const {activeDatabase, panelSizes, setPanelSizes} = useUIStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePanelResize = (layout: any) => {
    const editorSize = layout['editor'];
    if (editorSize !== undefined) {
      setPanelSizes({editor: editorSize});
    }
  };

  return (
    <Group
      orientation="vertical"
      onLayoutChange={handlePanelResize}
      style={{height: '100%', width: '100%'}}
    >
      {/* Editor Panel */}
      <Panel
        id="editor"
        defaultSize={'' + panelSizes.editor}
        minSize="20"
      >
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
          {/* Editor Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Query Editor
              </span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${activeDatabase === 'postgresql'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}
              >
                {activeDatabase === 'postgresql' ? 'PostgreSQL' : 'MongoDB'}
              </span>
            </div>

            {!isReady && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isLoading ? 'Loading...' : 'Connecting...'}</span>
              </div>
            )}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <QueryEditor
              mode={activeDatabase}
              value={content}
              onChange={setContent}
              onRun={onRun}
              readOnly={isRunning || !isReady}
              height="100%"
            />
          </div>

          {/* Editor Toolbar */}
          <div className="flex-shrink-0">
            <EditorToolbar
              onRun={onRun}
              onClear={() => setContent('')}
              mode={activeDatabase}
              isRunning={isRunning}
            />
          </div>
        </div>
      </Panel>

      {/* Resize Handle */}
      <Separator
        style={{
          height: '4px',
          backgroundColor: '#e5e7eb',
          cursor: 'row-resize',
        }}
      />

      {/* Results Panel */}
      <Panel id="results" minSize="15">
        <ResultsPanel result={result} isRunning={isRunning} />
      </Panel>
    </Group>
  );
}
