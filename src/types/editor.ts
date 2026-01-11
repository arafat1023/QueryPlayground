import type { editor } from 'monaco-editor';

export type DatabaseMode = 'postgresql' | 'mongodb';
export type EditorTheme = 'light' | 'dark';

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
  theme: EditorTheme;
}

export interface MonacoTheme {
  base: 'vs' | 'vs-dark';
  inherit: boolean;
  rules: editor.ITokenThemeRule[];
  colors: Record<string, string>;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  database: DatabaseMode;
  timestamp: number;
  success: boolean;
}

export interface QueryEditorProps {
  mode: DatabaseMode;
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  height?: string | number;
  readOnly?: boolean;
  theme?: EditorTheme;
}

export interface EditorToolbarProps {
  onRun: () => void;
  onClear: () => void;
  onSave?: () => void;
  isRunning?: boolean;
  mode: DatabaseMode;
}
