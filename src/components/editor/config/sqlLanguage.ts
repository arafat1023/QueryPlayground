import type { Monaco } from '@monaco-editor/react';

/**
 * Configure SQL language for Monaco Editor
 * Uses built-in 'sql' language with custom configuration
 */
export function configureSQLLanguage(monaco: Monaco): void {
  // Set language configuration for SQL
  monaco.languages.setLanguageConfiguration('sql', {
    comments: {
      lineComment: '--',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['(', ')'],
      ['[', ']'],
    ],
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' },
    ],
    surroundingPairs: [
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' },
    ],
    folding: {
      markers: {
        start: /^\s*--\s*#region\b/,
        end: /^\s*--\s*#endregion\b/,
      },
    },
  });
}

/**
 * Get SQL keywords for auto-completion
 */
export const SQL_KEYWORDS = [
  // Query commands
  'SELECT',
  'FROM',
  'WHERE',
  'INSERT',
  'INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'CREATE',
  'TABLE',
  'DROP',
  'ALTER',
  'INDEX',
  'JOIN',
  'INNER',
  'OUTER',
  'LEFT',
  'RIGHT',
  'FULL',
  'ON',
  'AS',
  'AND',
  'OR',
  'NOT',
  'IN',
  'EXISTS',
  'BETWEEN',
  'LIKE',
  'IS',
  'NULL',
  'ORDER BY',
  'GROUP BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'DISTINCT',
  'UNION',
  'INTERSECT',
  'EXCEPT',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  // Data types
  'INTEGER',
  'VARCHAR',
  'TEXT',
  'BOOLEAN',
  'DATE',
  'TIMESTAMP',
  'DECIMAL',
  'NUMERIC',
  'FLOAT',
  'REAL',
  'SERIAL',
  // Aggregate functions
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'ARRAY_AGG',
  'STRING_AGG',
  // Other
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'CONSTRAINT',
  'UNIQUE',
  'CHECK',
  'DEFAULT',
  'CASCADE',
  'NULLS',
  'FIRST',
  'LAST',
  'ASC',
  'DESC',
];
