import {useRef, useEffect, useCallback} from 'react';
import Editor, {type OnMount, type OnChange, type Monaco} from '@monaco-editor/react';
import type {editor} from 'monaco-editor';
import {useEditorKeyboard} from './hooks/useEditorKeyboard';
import {configureSQLLanguage} from './config/sqlLanguage';
import {configureMongoLanguage} from './config/mongoLanguage';
import {
  sqlDarkTheme,
  sqlLightTheme,
  mongoDarkTheme,
  mongoLightTheme,
  getThemeId,
  THEME_IDS,
} from './config/editorThemes';
import type {QueryEditorProps} from '@/types/editor';

/**
 * QueryEditor component - Monaco Editor wrapper for SQL and MongoDB queries
 *
 * Features:
 * - SQL syntax highlighting for PostgreSQL mode
 * - JavaScript syntax highlighting for MongoDB mode
 * - Custom themes (blue for SQL, purple for MongoDB)
 * - Keyboard shortcuts (Ctrl+Enter to run)
 */
export function QueryEditor({
  mode,
  value,
  onChange,
  onRun,
  height = '400px',
  readOnly = false,
  theme = 'light',
  errorLine,
}: QueryEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  // Set up keyboard shortcuts
  useEditorKeyboard({editorRef, onRun});

  // Get language based on mode
  const getLanguage = useCallback(() => {
    return mode === 'postgresql' ? 'sql' : 'javascript';
  }, [mode]);

  // Handle editor mount
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register custom themes
    monaco.editor.defineTheme(THEME_IDS.SQL_DARK, sqlDarkTheme);
    monaco.editor.defineTheme(THEME_IDS.SQL_LIGHT, sqlLightTheme);
    monaco.editor.defineTheme(THEME_IDS.MONGO_DARK, mongoDarkTheme);
    monaco.editor.defineTheme(THEME_IDS.MONGO_LIGHT, mongoLightTheme);

    // Configure languages
    configureSQLLanguage(monaco);
    configureMongoLanguage(monaco);
  };

  // Handle value change
  const handleChange: OnChange = (newValue) => {
    onChange(newValue || '');
  };

  // Update theme when mode or theme prop changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const themeId = getThemeId(mode, theme);
      (monacoRef.current as Monaco).editor.setTheme(themeId);
    }
  }, [mode, theme]);

  // Update language when mode changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const language = getLanguage();
      const model = editorRef.current.getModel();
      if (model) {
        (monacoRef.current as Monaco).editor.setModelLanguage(model, language);
      }
    }
  }, [mode, getLanguage]);

  // Update read-only state
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({readOnly});
    }
  }, [readOnly]);

  // Highlight error line in editor
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const ed = editorRef.current;
    const monaco = monacoRef.current;

    if (errorLine && errorLine > 0) {
      decorationsRef.current = ed.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(errorLine, 1, errorLine, 1),
          options: {
            isWholeLine: true,
            className: 'bg-red-100 dark:bg-red-900/30',
            glyphMarginClassName: 'text-red-500',
          },
        },
      ]);
    } else {
      decorationsRef.current = ed.deltaDecorations(decorationsRef.current, []);
    }
  }, [errorLine]);

  // Memoize editor options
  const editorOptions = useCallback(
    () => ({
      minimap: {enabled: false},
      fontSize: 14,
      tabSize: 2,
      wordWrap: 'on' as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      readOnly,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      parameterHints: {enabled: true},
      folding: true,
      lineNumbers: 'on' as const,
      renderWhitespace: 'selection' as const,
      cursorStyle: 'line' as const,
      formatOnPaste: true,
      formatOnType: true,
      accessibilitySupport: 'on' as const,
      ariaLabel: 'Query editor',
    }),
    [readOnly]
  );

  const currentTheme = getThemeId(mode, theme);

  return (
    <div className="h-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={getLanguage()}
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme={currentTheme}
        options={editorOptions()}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
