import { useEffect, useRef } from 'react';
import type { editor, IKeyboardEvent } from 'monaco-editor';
import type { IDisposable } from 'monaco-editor';

interface UseEditorKeyboardProps {
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
  onRun: () => void;
  onSave?: () => void;
}

/**
 * Hook to set up keyboard shortcuts for the Monaco editor
 * - Ctrl+Enter / Cmd+Enter: Run query
 * - Ctrl+S / Cmd+S: Save query (placeholder for future)
 */
export function useEditorKeyboard({
  editorRef,
  onRun,
  onSave,
}: UseEditorKeyboardProps): void {
  const disposablesRef = useRef<IDisposable[]>([]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Clean up previous disposables
    disposablesRef.current.forEach((d) => d.dispose());
    disposablesRef.current = [];

    // Register actual Ctrl+Enter shortcut using onKeyDown
    const keyDownDisposable = editor.onKeyDown((e: IKeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onRun();
      } else if (e.metaKey && e.code === 'Enter') {
        // macOS: Cmd+Enter
        e.preventDefault();
        e.stopPropagation();
        onRun();
      } else if (onSave && ((e.ctrlKey && e.code === 'KeyS') || (e.metaKey && e.code === 'KeyS'))) {
        e.preventDefault();
        e.stopPropagation();
        onSave();
      }
    });

    disposablesRef.current = [keyDownDisposable];

    return () => {
      disposablesRef.current.forEach((d) => d.dispose());
      disposablesRef.current = [];
    };
  }, [editorRef, onRun, onSave]);
}
