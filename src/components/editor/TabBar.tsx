import { useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

export function TabBar() {
  const tabs = useEditorStore(s => s.tabs);
  const activeTabId = useEditorStore(s => s.activeTabId);
  const switchTab = useEditorStore(s => s.switchTab);
  const addTab = useEditorStore(s => s.addTab);
  const removeTab = useEditorStore(s => s.removeTab);
  const renameTab = useEditorStore(s => s.renameTab);

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleDoubleClick = (tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditName(currentName);
  };

  const handleRenameSubmit = (tabId: string) => {
    const trimmed = editName.trim();
    if (trimmed) {
      renameTab(tabId, trimmed);
    }
    setEditingTabId(null);
  };

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const tabIds = tabs.map(t => t.id);
      const currentIdx = tabIds.indexOf(activeTabId);
      if (currentIdx === -1) return;

      let targetIdx: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
          targetIdx = (currentIdx + 1) % tabIds.length;
          break;
        case 'ArrowLeft':
          targetIdx = (currentIdx - 1 + tabIds.length) % tabIds.length;
          break;
        case 'Home':
          targetIdx = 0;
          break;
        case 'End':
          targetIdx = tabIds.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          switchTab(tabIds[currentIdx]);
          return;
        case 'Delete':
          if (tabIds.length > 1) {
            e.preventDefault();
            removeTab(tabIds[currentIdx]);
          }
          return;
        default:
          return;
      }

      e.preventDefault();
      const targetId = tabIds[targetIdx];
      switchTab(targetId);
      document.getElementById(`tab-${targetId}`)?.focus();
    },
    [tabs, activeTabId, switchTab, removeTab]
  );

  return (
    <div
      className="flex items-center gap-0.5 px-1 py-1 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 overflow-x-auto flex-shrink-0"
      role="tablist"
      aria-label="Query tabs"
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          aria-selected={tab.id === activeTabId}
          tabIndex={tab.id === activeTabId ? 0 : -1}
          className={`group flex items-center gap-1.5 px-3 py-1 rounded-md text-xs cursor-pointer transition-colors select-none ${
            tab.id === activeTabId
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          onClick={() => switchTab(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab.id, tab.name)}
          onKeyDown={handleTabKeyDown}
        >
          {/* Database indicator dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            tab.database === 'postgresql' ? 'bg-blue-500' : 'bg-green-500'
          }`} />

          {editingTabId === tab.id ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRenameSubmit(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit(tab.id);
                if (e.key === 'Escape') setEditingTabId(null);
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-20 px-1 py-0 text-xs bg-transparent border-b border-blue-500 outline-none dark:text-white"
              autoFocus
            />
          ) : (
            <span className="truncate max-w-[100px]">{tab.name}</span>
          )}

          {/* Dirty indicator */}
          {tab.isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" title="Unsaved changes" />
          )}

          {/* Close button */}
          {tabs.length > 1 && (
            <button
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex-shrink-0"
              aria-label={`Close tab ${tab.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {/* Add tab button */}
      {tabs.length < 10 && (
        <button
          onClick={() => addTab()}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          aria-label="New tab"
          title="New tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
