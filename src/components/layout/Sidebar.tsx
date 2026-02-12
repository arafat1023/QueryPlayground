import { SchemaExplorer } from '@/components/schema/SchemaExplorer';
import { QueryHistory } from '@/components/sidebar/QueryHistory';
import { SavedQueries } from '@/components/sidebar/SavedQueries';

interface SidebarProps {
  onResetToDefault?: () => void;
}

export function Sidebar({ onResetToDefault }: SidebarProps) {
  return (
    <aside className="h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden" role="complementary" aria-label="Sidebar">
      {/* Schema Explorer Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <SchemaExplorer onResetToDefault={onResetToDefault} />
      </div>

      {/* Saved Queries Section */}
      <SavedQueries />

      {/* Query History Section */}
      <QueryHistory />
    </aside>
  );
}
