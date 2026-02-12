import {useEffect, useState} from 'react';
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
  onResetToDefault?: () => void;
}

export function MainLayout({
  isRunning,
  result,
  onRun,
  onDatabaseChange,
  isReady,
  isLoading,
  onResetToDefault,
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
                <Sidebar onResetToDefault={onResetToDefault} />
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
                <div className="h-full w-1 bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-500 transition-colors mx-auto" />
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
      <MobileSidebar onResetToDefault={onResetToDefault} />
    </div>
  );
}

function MobileSidebar({ onResetToDefault }: { onResetToDefault?: () => void }) {
  const {sidebarCollapsed, setSidebarCollapsed} = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [animState, setAnimState] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    if (!sidebarCollapsed) {
      setMounted(true);
      setAnimState('enter');
      const raf = requestAnimationFrame(() => {
        setAnimState('visible');
      });
      return () => cancelAnimationFrame(raf);
    } else if (mounted) {
      setAnimState('exit');
      const timer = setTimeout(() => {
        setMounted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [sidebarCollapsed]); // eslint-disable-line react-hooks/exhaustive-deps

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
