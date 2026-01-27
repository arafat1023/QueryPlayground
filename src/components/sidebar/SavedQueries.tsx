import { useState } from 'react';
import { Bookmark, Pencil, Trash2, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
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

  const handleSave = () => {
    const next = name.trim();
    if (next.length === 0) return;
    onRename(item.id, next);
    setIsEditing(false);
  };

  return (
    <div
      className="group flex items-start gap-2 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-md"
      onClick={() => {
        if (!isEditing) onSelect(item);
      }}
      title={!isEditing ? 'Load query' : undefined}
    >
      <div className="flex-1 text-left min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-700"
              autoFocus
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Save name"
            >
              <Check className="w-3.5 h-3.5 text-green-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
                setName(item.name);
              }}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {item.name}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate">
              {item.query.replace(/\s+/g, ' ').trim()}
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Edit name"
            aria-label="Edit saved query name"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Delete"
            aria-label="Delete saved query"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function SavedQueries() {
  const { savedQueries, removeSavedQuery, updateSavedQueryName } = useHistoryStore();
  const { setContent } = useEditorStore();
  const { setActiveDatabase } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pgQueries = savedQueries.filter((q) => q.database === 'postgresql');
  const mongoQueries = savedQueries.filter((q) => q.database === 'mongodb');

  const handleSelect = (item: SavedQuery) => {
    setActiveDatabase(item.database);
    setContent(item.query);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center gap-2 text-left"
          title={isCollapsed ? 'Expand saved queries' : 'Collapse saved queries'}
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
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto p-1 space-y-2">
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
                      onDelete={removeSavedQuery}
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
                      onDelete={removeSavedQuery}
                      onRename={updateSavedQueryName}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
