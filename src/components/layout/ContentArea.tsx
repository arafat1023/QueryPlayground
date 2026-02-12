import { useState, useEffect, useMemo, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Loader2, Code } from 'lucide-react';
import { QueryEditor } from '@/components/editor/QueryEditor';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { TabBar } from '@/components/editor/TabBar';
import { ResultsPanel } from '@/components/results/ResultsPanel';
import { SaveQueryModal } from '@/components/sidebar/SaveQueryModal';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { debounce } from '@/utils/debounce';
import type { QueryResult } from '@/types';

interface ContentAreaProps {
  isRunning: boolean;
  result: QueryResult | null;
  onRun: () => void;
  onCancel?: () => void;
  isReady: boolean;
  isLoading?: boolean;
}

export function ContentArea({ isRunning, result, onRun, onCancel, isReady, isLoading }: ContentAreaProps) {
  const { content, setContent } = useEditorStore();
  const activeTabId = useEditorStore(s => s.activeTabId);
  const tabs = useEditorStore(s => s.tabs);
  const { activeDatabase, setActiveDatabase, panelSizes, setPanelSizes } = useUIStore();
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Track previous tab to detect tab switches
  const prevTabIdRef = useRef(activeTabId);

  // Sync activeDatabase when tab changes
  useEffect(() => {
    if (prevTabIdRef.current !== activeTabId) {
      prevTabIdRef.current = activeTabId;
      const activeTab = tabs.find(t => t.id === activeTabId);
      if (activeTab && activeTab.database !== activeDatabase) {
        setActiveDatabase(activeTab.database);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId]);

  // Debounce the resize handler to prevent excessive re-renders/storage updates
  const handlePanelResize = useMemo(
    () =>
      debounce((layout: any) => {
        const editorSize = layout['editor'];
        if (editorSize !== undefined) {
          setPanelSizes({ editor: editorSize });
        }
      }, 300),
    [setPanelSizes]
  );

  return (
    <>
      <Group
        id="main-content"
        orientation="vertical"
        onLayoutChange={handlePanelResize}
        style={{ height: '100%', width: '100%' }}
        role="main"
      >
        {/* Editor Panel */}
        <Panel id="editor" defaultSize={'' + panelSizes.editor} minSize="20">
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

            {/* Tab Bar */}
            <TabBar />

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
              <QueryEditor
                mode={activeDatabase}
                value={content}
                onChange={setContent}
                onRun={onRun}
                readOnly={isRunning || !isReady}
                height="100%"
                errorLine={result && !result.success && result.error && typeof result.error !== 'string' ? result.error.line : undefined}
              />
              {/* Placeholder overlay when editor is empty */}
              {!content && (
                <div className="absolute inset-0 flex items-start pt-3 pl-16 pointer-events-none z-[1]">
                  <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {activeDatabase === 'postgresql'
                      ? 'Write a SQL query... (Ctrl+Enter to run)'
                      : 'Write a MongoDB query... (Ctrl+Enter to run)'}
                  </span>
                </div>
              )}
              {/* Database loading overlay */}
              {!isReady && (
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {isLoading ? 'Database loading...' : 'Connecting to database...'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Toolbar */}
            <div className="flex-shrink-0">
              <EditorToolbar
                onRun={onRun}
                onCancel={onCancel}
                onClear={() => setContent('')}
                onSave={() => setShowSaveModal(true)}
                mode={activeDatabase}
                isRunning={isRunning}
              />
            </div>
          </div>
        </Panel>

        {/* Resize Handle */}
        <Separator
          className="flex items-center justify-center separator-horizontal"
          style={{
            height: '10px',
            cursor: 'row-resize',
          }}
        >
          <div className="w-full h-[3px] rounded-full bg-gray-300 dark:bg-gray-600 transition-colors" />
        </Separator>

        {/* Results Panel */}
        <Panel id="results" minSize="15">
          <ResultsPanel result={result} isRunning={isRunning} />
        </Panel>
      </Group>

      <SaveQueryModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        query={content}
        database={activeDatabase}
      />
    </>
  );
}
