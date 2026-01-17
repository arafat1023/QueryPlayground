import { useState } from 'react';
import ReactJson from '@uiw/react-json-view';
import { Copy, Download } from 'lucide-react';
import { copyToClipboard, exportToJSON } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface JsonViewProps {
  data: unknown[];
  className?: string;
}

/**
 * JsonView component for displaying MongoDB results
 * Uses @uiw/react-json-view for syntax highlighting and collapsible tree
 */
export function JsonView({ data, className = '' }: JsonViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | -1>(-1);

  const handleCopyJson = async (json: string, index: number) => {
    const success = await copyToClipboard(json);
    if (success) {
      setCopiedIndex(index);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedIndex(-1), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleExportAll = () => {
    exportToJSON(data, `query-results-${Date.now()}.json`);
    toast.success('Exported to JSON');
  };

  const handleExportSingle = (item: unknown, index: number) => {
    const json = JSON.stringify(item, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${index + 1}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported document ${index + 1}`);
  };

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 dark:text-gray-400 ${className}`}>
        <p className="text-sm">Query executed successfully. No documents returned.</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with export all button */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {data.length} document{data.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={handleExportAll}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          title="Export all as JSON"
        >
          <Download className="w-3 h-3" />
          Export All
        </button>
      </div>

      {/* JSON documents */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {data.map((item, index) => {
          const itemWithId = item as Record<string, unknown> & { _id?: unknown };
          const uniqueKey = String(itemWithId._id || index);
          return (
            <div
              key={uniqueKey}
              className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
            {/* Document header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                [{index + 1}] {String((item as Record<string, unknown>)._id || `doc_${index + 1}`)}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopyJson(JSON.stringify(item, null, 2), index)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="Copy JSON"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleExportSingle(item, index)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="Download as JSON"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* JSON content */}
            <div className="p-3 bg-white dark:bg-gray-900">
              <ReactJson
                value={item as Record<string, unknown>}
                displayDataTypes={false}
                displayObjectSize={true}
                enableClipboard={false}
                collapsed={2}
                className="json-viewer"
                style={{
                  backgroundColor: 'transparent',
                  fontSize: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                }}
              />
            </div>

            {/* Copied indicator */}
            {copiedIndex === index && (
              <div className="absolute top-0 right-0 px-2 py-1 bg-green-500 text-white text-xs rounded-bl-lg">
                Copied!
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

// Add custom styles for JSON viewer
const style = document.createElement('style');
style.textContent = `
  .json-viewer {
    --w-rjv-cursor: pointer;
    --w-rjv-font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    --w-rjv-font-size: 12px;
    --w-rjv-line-color: #e5e7eb;
    --w-rjv-arrow-color: #6b7280;
    --w-rjv-info-string: #0550ae;
    --w-rjv-info-number: #0550ae;
    --w-rjv-info-boolean: #0550ae;
    --w-rjv-key-string: #24292f;
    --w-rjv-background-color: transparent;
  }

  .dark .json-viewer {
    --w-rjv-line-color: #374151;
    --w-rjv-arrow-color: #9ca3af;
    --w-rjv-info-string: #7dd3fc;
    --w-rjv-info-number: #7dd3fc;
    --w-rjv-info-boolean: #7dd3fc;
    --w-rjv-key-string: #e5e7eb;
    --w-rjv-background-color: transparent;
  }

  .json-viewer .w-rjv-values:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .dark .json-viewer .w-rjv-values:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;
if (!document.head.querySelector('style[data-json-viewer]')) {
  style.setAttribute('data-json-viewer', 'true');
  document.head.appendChild(style);
}
