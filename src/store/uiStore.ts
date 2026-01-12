import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DatabaseMode } from '@/types/editor';

export type Theme = 'light' | 'dark';

interface PanelSizes {
  sidebar: number;
  editor: number;
}

interface UIState {
  // Theme
  theme: Theme;

  // Active database
  activeDatabase: DatabaseMode;

  // Panel sizes (percentages)
  panelSizes: PanelSizes;

  // Sidebar collapsed state (for mobile)
  sidebarCollapsed: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setActiveDatabase: (db: DatabaseMode) => void;
  setPanelSizes: (sizes: Partial<PanelSizes>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const DEFAULT_PANEL_SIZES: PanelSizes = {
  sidebar: 20, // 20% of horizontal space
  editor: 60, // 60% of vertical space (results gets 40%)
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'light',
      activeDatabase: 'postgresql',
      panelSizes: DEFAULT_PANEL_SIZES,
      sidebarCollapsed: false,

      // Set theme
      setTheme: (theme: Theme) => {
        set({ theme });
        // Update document class for CSS variables
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Toggle theme
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // Set active database
      setActiveDatabase: (db: DatabaseMode) => {
        set({ activeDatabase: db });
      },

      // Set panel sizes
      setPanelSizes: (sizes: Partial<PanelSizes>) => {
        set({
          panelSizes: { ...get().panelSizes, ...sizes },
        });
      },

      // Set sidebar collapsed state
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      // Toggle sidebar
      toggleSidebar: () => {
        set({ sidebarCollapsed: !get().sidebarCollapsed });
      },
    }),
    {
      name: 'qp_ui',
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
