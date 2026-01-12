import {useEffect} from 'react';
import {Panel, Group, Separator} from 'react-resizable-panels';
import {Header} from './Header';
import {Sidebar} from './Sidebar';
import {ContentArea} from './ContentArea';
import {useUIStore} from '@/store/uiStore';
import type {DatabaseMode} from '@/types/editor';
import type {QueryResult} from '@/types';

interface MainLayoutProps {
  isRunning: boolean;
  result: QueryResult | null;
  onRun: () => void;
  onDatabaseChange: (db: DatabaseMode) => void;
  isReady: boolean;
  isLoading?: boolean;
}

export function MainLayout({
  isRunning,
  result,
  onRun,
  onDatabaseChange,
  isReady,
  isLoading,
}: MainLayoutProps) {
  const {panelSizes, setPanelSizes, sidebarCollapsed, setSidebarCollapsed} = useUIStore();

  // Collapse sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSidebarResize = (layout: any) => {
    const sidebarSize = layout['sidebar'];
    if (sidebarSize !== undefined) {
      setPanelSizes({sidebar: sidebarSize});
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* Header */}
      <Header onDatabaseChange={onDatabaseChange} />

      {/* Main content with resizable panels */}
      <div className="flex-1 overflow-hidden">
        <Group
          orientation="horizontal"
          onLayoutChange={handleSidebarResize}
          style={{height: '100%', width: '100%'}}
        >
          {/* Sidebar Panel - only on large screens */}
          {!sidebarCollapsed && (
            <>
              <Panel
                id="sidebar"
                defaultSize={'' + panelSizes.sidebar}
                minSize="15"
                maxSize="35"
                className="hidden lg:block"
              >
                <Sidebar />
              </Panel>

              {/* Resize Handle */}
              <Separator
                className="hidden lg:block group"
                style={{
                  width: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'col-resize',
                  zIndex: 10,
                  position: 'relative',
                }}
              >
                <div className="h-full w-1 bg-gray-200 group-hover:bg-blue-500 transition-colors mx-auto" />
              </Separator>
            </>
          )}

          {/* Content Area Panel */}
          <Panel id="content" minSize="30">
            <ContentArea
              isRunning={isRunning}
              result={result}
              onRun={onRun}
              isReady={isReady}
              isLoading={isLoading}
            />
          </Panel>
        </Group>
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar />
    </div>
  );
}

function MobileSidebar() {
  const {sidebarCollapsed, setSidebarCollapsed} = useUIStore();

  if (sidebarCollapsed) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setSidebarCollapsed(true)}
      />

      {/* Sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-xl">
        <Sidebar />
      </div>
    </div>
  );
}
