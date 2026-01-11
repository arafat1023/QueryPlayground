import type { MonacoTheme } from '@/types/editor';

// SQL Dark Theme - Blue keywords
export const sqlDarkTheme: MonacoTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword.sql', foreground: '569CD6', fontStyle: 'bold' },
    { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
    { token: 'operator.sql', foreground: 'D4D4D4' },
    { token: 'operator', foreground: 'D4D4D4' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'string.sql', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'number.sql', foreground: 'B5CEA8' },
    { token: 'comment', foreground: '6A9955' },
    { token: 'comment.sql', foreground: '6A9955' },
    { token: 'identifier', foreground: '9CDCFE' },
    { token: 'identifier.sql', foreground: '9CDCFE' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
  },
};

// SQL Light Theme - Blue keywords
export const sqlLightTheme: MonacoTheme = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword.sql', foreground: '0000FF', fontStyle: 'bold' },
    { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
    { token: 'operator.sql', foreground: '000000' },
    { token: 'operator', foreground: '000000' },
    { token: 'string', foreground: 'A31515' },
    { token: 'string.sql', foreground: 'A31515' },
    { token: 'number', foreground: '098658' },
    { token: 'number.sql', foreground: '098658' },
    { token: 'comment', foreground: '008000' },
    { token: 'comment.sql', foreground: '008000' },
    { token: 'identifier', foreground: '001080' },
    { token: 'identifier.sql', foreground: '001080' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
  },
};

// MongoDB Dark Theme - Purple keywords
export const mongoDarkTheme: MonacoTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
    { token: 'identifier', foreground: '9CDCFE' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'string.key', foreground: '9CDCFE' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'delimiter.bracket', foreground: 'FFD700' },
    { token: 'tag', foreground: '569CD6' },
    { token: 'regexp', foreground: 'D16969' },
    { token: 'comment', foreground: '6A9955' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
  },
};

// MongoDB Light Theme - Purple keywords
export const mongoLightTheme: MonacoTheme = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'AF00DB', fontStyle: 'bold' },
    { token: 'identifier', foreground: '001080' },
    { token: 'string', foreground: 'A31515' },
    { token: 'string.key', foreground: '0451A5' },
    { token: 'number', foreground: '098658' },
    { token: 'delimiter.bracket', foreground: '000000' },
    { token: 'tag', foreground: '800080' },
    { token: 'regexp', foreground: 'DD1144' },
    { token: 'comment', foreground: '008000' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
  },
};

// Theme IDs for Monaco registration
export const THEME_IDS = {
  SQL_DARK: 'sql-dark',
  SQL_LIGHT: 'sql-light',
  MONGO_DARK: 'mongo-dark',
  MONGO_LIGHT: 'mongo-light',
} as const;

// Get theme ID based on database mode and theme setting
export const getThemeId = (
  mode: 'postgresql' | 'mongodb',
  theme: 'light' | 'dark'
): string => {
  if (mode === 'postgresql') {
    return theme === 'dark' ? THEME_IDS.SQL_DARK : THEME_IDS.SQL_LIGHT;
  }
  return theme === 'dark' ? THEME_IDS.MONGO_DARK : THEME_IDS.MONGO_LIGHT;
};
