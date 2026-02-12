import { Clock, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Tooltip } from '@/components/common/Tooltip';
import type { QueryHistoryItem } from '@/types/editor';

interface HistoryItemProps {
  item: QueryHistoryItem;
  onSelect: (item: QueryHistoryItem) => void;
  onDelete: (id: string) => void;
}

const formatTimestamp = (ts: number): string => {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
};

const formatPreview = (query: string): string => {
  const singleLine = query.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= 120) return singleLine;
  return singleLine.slice(0, 120) + '...';
};

export function HistoryItem({ item, onSelect, onDelete }: HistoryItemProps) {
  const dbLabel = item.database === 'postgresql' ? 'PG' : 'Mongo';
  const statusColor = item.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="group flex items-start gap-2 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-md transition-colors">
      <Tooltip label={item.query} position="top" multiline>
        <button
          onClick={() => onSelect(item)}
          className="flex-1 text-left min-w-0"
          title=""
        >
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400`}>
              {dbLabel}
            </span>
            <span className={`flex items-center gap-1 text-xs ${statusColor}`}>
              {item.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {item.success ? 'Success' : 'Error'}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-700 dark:text-gray-300 font-mono truncate">
            {formatPreview(item.query)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            {formatTimestamp(item.timestamp)}
          </div>
        </button>
      </Tooltip>

      <button
        onClick={() => onDelete(item.id)}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
        title="Delete history item"
        aria-label="Delete history item"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
