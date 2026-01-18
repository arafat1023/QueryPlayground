/**
 * Export utilities for query results
 * Supports CSV and JSON export formats
 */

export interface ExportOptions {
  format: 'csv' | 'json';
  filename?: string;
}

/**
 * Convert query results to CSV format
 */
export function exportToCSV(
  rows: unknown[],
  filename: string = 'query-results.csv'
): void {
  if (rows.length === 0) {
    downloadFile('', filename, 'text/csv');
    return;
  }

  const columns = Object.keys(rows[0] as object);

  // Create CSV header
  let csv = columns.map(escapeCSV).join(',') + '\n';

  // Add data rows
  for (const row of rows) {
    const values = columns.map((col) => {
      const value = (row as Record<string, unknown>)[col];
      return escapeCSV(formatValueForCSV(value));
    });
    csv += values.join(',') + '\n';
  }

  downloadFile(csv, filename, 'text/csv');
}

/**
 * Convert query results to JSON format
 */
export function exportToJSON(
  rows: unknown[],
  filename: string = 'query-results.json'
): void {
  const json = JSON.stringify(rows, null, 2);
  downloadFile(json, filename, 'application/json');
}

/**
 * Export a single row as JSON
 */
export function exportRowAsJSON(row: Record<string, unknown>, filename?: string): void {
  const json = JSON.stringify(row, null, 2);
  const defaultFilename = `row-${Date.now()}.json`;
  downloadFile(json, filename || defaultFilename, 'application/json');
}

/**
 * Copy cell value to clipboard
 */
export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Copy entire table as CSV
 */
export async function copyTableAsCSV(rows: unknown[]): Promise<boolean> {
  if (rows.length === 0) return false;

  const columns = Object.keys(rows[0] as object);

  // Create CSV header
  let csv = columns.map(escapeCSV).join(',') + '\n';

  // Add data rows
  for (const row of rows) {
    const values = columns.map((col) => {
      const value = (row as Record<string, unknown>)[col];
      return escapeCSV(formatValueForCSV(value));
    });
    csv += values.join(',') + '\n';
  }

  return copyToClipboard(csv);
}

/**
 * Copy entire table as JSON
 */
export async function copyTableAsJSON(rows: unknown[]): Promise<boolean> {
  return copyToClipboard(JSON.stringify(rows, null, 2));
}

// Helper functions

function escapeCSV(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatValueForCSV(value: unknown): string {
  if (value === null) return 'NULL';
  if (value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
