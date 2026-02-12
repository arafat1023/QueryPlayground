import { useState, useMemo, useEffect, useCallback } from 'react';
import { Bookmark, Pencil, Trash2, Check, X, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useHistoryStore } from '@/store/historyStore';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import type { SavedQuery } from '@/types/editor';

interface SavedQueryRowProps {
  item: SavedQuery;
  onSelect: (item: SavedQuery) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

function SavedQueryRow({ item, onSelect, onDelete, onRename }: SavedQueryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(false);

  // Auto-revert delete confirmation after 3 seconds
  useEffect(() => {
    if (!confirmingDeleteId) return;
    const timer = setTimeout(() => {
      setConfirmingDeleteId(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [confirmingDeleteId]);

  const handleSave = () => {
    const next = name.trim();
    if (next.length === 0) return;
    onRename(item.id, next);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (!confirmingDeleteId) {
      setConfirmingDeleteId(true);
    }
  };

  const handleConfirmDelete = () => {
    setConfirmingDeleteId(false);
    onDelete(item.id);
  };

  const handleCancelDelete = () => {
    setConfirmingDeleteId(false);
  };

  if (isEditing) {
    return (
      <div className="group flex items-start gap-2 px-2 py-2 rounded-md">
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-700"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Save name"
            >
              <Check className="w-3.5 h-3.5 text-green-600" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setName(item.name);
              }}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-md transition-colors">
      <button onClick={() => onSelect(item)} className="flex-1 text-left min-w-0" title="Load query">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {item.name}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate">
          {item.query.replace(/\s+/g, ' ').trim()}
        </div>
      </button>

      <div className="flex items-center gap-1">
        {confirmingDeleteId ? (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-red-600 dark:text-red-400 whitespace-nowrap">Delete?</span>
            <button
              onClick={handleConfirmDelete}
              className="px-1 py-0.5 rounded text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={handleCancelDelete}
              className="px-1 py-0.5 rounded text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              title="Edit name"
              aria-label="Edit saved query name"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              title="Delete"
              aria-label="Delete saved query"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function SavedQueries() {
  const { savedQueries, removeSavedQuery, addSavedQuery, updateSavedQueryName } = useHistoryStore();
  const { setContent } = useEditorStore();
  const { setActiveDatabase } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { pgQueries, mongoQueries } = useMemo(() => {
    const pg: SavedQuery[] = [];
    const mongo: SavedQuery[] = [];
    const term = searchTerm.toLowerCase().trim();

    savedQueries.forEach((q) => {
      // Apply search filter
      if (term && !q.name.toLowerCase().includes(term) && !q.query.toLowerCase().includes(term)) {
        return;
      }
      if (q.database === 'postgresql') {
        pg.push(q);
      } else {
        mongo.push(q);
      }
    });
    return { pgQueries: pg, mongoQueries: mongo };
  }, [savedQueries, searchTerm]);

  const handleSelect = (item: SavedQuery) => {
    setActiveDatabase(item.database);
    setContent(item.query);
  };

  const handleDelete = useCallback((id: string) => {
    // Find the query before removing it (for undo)
    const deletedQuery = savedQueries.find((q) => q.id === id);
    removeSavedQuery(id);

    if (deletedQuery) {
      toast('Query deleted', {
        action: {
          label: 'Undo',
          onClick: () => {
            addSavedQuery({
              name: deletedQuery.name,
              query: deletedQuery.query,
              database: deletedQuery.database,
            });
          },
        },
        duration: 5000,
      });
    }
  }, [savedQueries, removeSavedQuery, addSavedQuery]);

  const showSearch = savedQueries.length > 5;
  const hasSearchResults = pgQueries.length > 0 || mongoQueries.length > 0;

  return (
    <div className="border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center gap-2 text-left"
          aria-label={isCollapsed ? 'Expand saved queries' : 'Collapse saved queries'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
          <Bookmark className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Saved</span>
          {savedQueries.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">({savedQueries.length})</span>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {savedQueries.length === 0 ? (
            <div className="py-6 px-3 text-center">
              <Bookmark className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">No saved queries</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                Save a query using the toolbar button or Ctrl+S
              </p>
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
                      placeholder="Search saved queries..."
                      className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>
                </div>
              )}
              {!hasSearchResults && searchTerm.trim() ? (
                <div className="py-4 px-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">No matching queries</p>
                </div>
              ) : (
                <div className="max-h-[40vh] overflow-y-auto p-1 space-y-2">
                  <div>
                    <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      PostgreSQL
                    </div>
                    {pgQueries.length === 0 ? (
                      <div className="px-2 pb-2 text-xs text-gray-500 dark:text-gray-400">
                        No saved PostgreSQL queries
                      </div>
                    ) : (
                      pgQueries.map((item) => (
                        <SavedQueryRow
                          key={item.id}
                          item={item}
                          onSelect={handleSelect}
                          onDelete={handleDelete}
                          onRename={updateSavedQueryName}
                        />
                      ))
                    )}
                  </div>

                  <div>
                    <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                      MongoDB
                    </div>
                    {mongoQueries.length === 0 ? (
                      <div className="px-2 pb-2 text-xs text-gray-500 dark:text-gray-400">
                        No saved MongoDB queries
                      </div>
                    ) : (
                      mongoQueries.map((item) => (
                        <SavedQueryRow
                          key={item.id}
                          item={item}
                          onSelect={handleSelect}
                          onDelete={handleDelete}
                          onRename={updateSavedQueryName}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
