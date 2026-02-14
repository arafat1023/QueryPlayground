import { useEffect, useMemo } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ContentArea } from './ContentArea';
import { StatusBar } from './StatusBar';
import { useUIStore } from '@/store/uiStore';
import { debounce } from '@/utils/debounce';
import { useAnimatedMount } from '@/hooks/useAnimatedMount';
import type { DatabaseMode } from '@/types/editor';
import type { QueryResult } from '@/types';

interface MainLayoutProps {
  isRunning: boolean;
  result: QueryResult | null;
  onRun: () => void;
  onCancel?: () => void;
  onDatabaseChange: (db: DatabaseMode) => void;
  isReady: boolean;
  isLoading?: boolean;
  onResetToDefault?: () => void;
}

export function MainLayout({
  isRunning,
  result,
  onRun,
  onCancel,
  onDatabaseChange,
  isReady,
  isLoading,
  onResetToDefault,
}: MainLayoutProps) {
  const { panelSizes, setPanelSizes, sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  // Collapse sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);



  // Debounce the resize handler to prevent excessive re-renders/storage updates
  const handleSidebarResize = useMemo(
    () =>
      debounce((layout: any) => {
        const sidebarSize = layout['sidebar'];
        if (sidebarSize !== undefined) {
          setPanelSizes({ sidebar: sidebarSize });
        }
      }, 300),
    [setPanelSizes]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950 overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">Skip to editor</a>
      {/* Header */}
      <Header onDatabaseChange={onDatabaseChange} />

      {/* Main content with resizable panels */}
      <div className="flex-1 overflow-hidden">
        <Group
          orientation="horizontal"
          onLayoutChange={handleSidebarResize}
          style={{ height: '100%', width: '100%' }}
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
                <Sidebar onResetToDefault={onResetToDefault} />
              </Panel>

              {/* Resize Handle */}
              <Separator
                className="hidden lg:flex items-center justify-center separator-vertical"
                style={{
                  width: '12px',
                  cursor: 'col-resize',
                  zIndex: 10,
                }}
              >
                <div className="h-full w-[3px] rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors" />
              </Separator>
            </>
          )}

          {/* Content Area Panel */}
          <Panel id="content" minSize="30">
            <ContentArea
              isRunning={isRunning}
              result={result}
              onRun={onRun}
              onCancel={onCancel}
              isReady={isReady}
              isLoading={isLoading}
            />
          </Panel>
        </Group>
      </div>

      {/* Status Bar */}
      <StatusBar isReady={isReady} isRunning={isRunning} />

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar onResetToDefault={onResetToDefault} />
    </div>
  );
}

function MobileSidebar({ onResetToDefault }: { onResetToDefault?: () => void }) {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { mounted, animState } = useAnimatedMount(!sidebarCollapsed);

  if (!mounted) return null;

  const backdropClass =
    animState === 'enter'
      ? 'modal-backdrop-enter'
      : animState === 'visible'
        ? 'modal-backdrop-visible'
        : 'modal-backdrop-exit';

  const sidebarClass =
    animState === 'enter'
      ? 'sidebar-slide-enter'
      : animState === 'visible'
        ? 'sidebar-slide-visible'
        : 'sidebar-slide-exit';

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 ${backdropClass}`}
        onClick={() => setSidebarCollapsed(true)}
      />

      {/* Sidebar */}
      <div className={`absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-xl ${sidebarClass}`}>
        <Sidebar onResetToDefault={onResetToDefault} />
      </div>
    </div>
  );
}
