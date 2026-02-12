import { useState, useMemo } from 'react';
import { History, Trash2, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useHistoryStore } from '@/store/historyStore';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { HistoryItem } from './HistoryItem';
import type { QueryHistoryItem } from '@/types/editor';

export function QueryHistory() {
  const { history, removeHistory, clearHistory } = useHistoryStore();
  const { setContent } = useEditorStore();
  const { setActiveDatabase } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const term = searchTerm.toLowerCase();
    return history.filter((item) =>
      item.query.toLowerCase().includes(term)
    );
  }, [history, searchTerm]);

  const handleSelect = (item: QueryHistoryItem) => {
    setActiveDatabase(item.database);
    setContent(item.query);
  };

  const showSearch = history.length > 5;

  return (
    <div className="border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center gap-2 text-left"
          aria-label={isCollapsed ? 'Expand history' : 'Collapse history'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
          <History className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">History</span>
          {history.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">({history.length})</span>
          )}
        </button>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            title="Clear history"
            aria-label="Clear history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          {history.length === 0 ? (
            <div className="py-6 px-3 text-center">
              <History className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">No queries yet</p>
            </div>
          ) : (
            <>
              {showSearch && (
                <div className="px-2 pt-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search history..."
                      className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>
                </div>
              )}
              <div className="max-h-56 overflow-y-auto p-1 space-y-1">
                {filteredHistory.length === 0 ? (
                  <div className="py-4 px-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">No matching queries</p>
                  </div>
                ) : (
                  filteredHistory.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      onSelect={handleSelect}
                      onDelete={removeHistory}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
