/**
 * File validation service for data import
 * Validates file size, type, and provides warnings for large files
 */

export interface FileValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  size: number;
  sizeMB: number;
}

const FILE_SIZE_LIMITS = {
  soft: 5 * 1024 * 1024, // 5MB - show warning
  hard: 10 * 1024 * 1024, // 10MB - block import
  workspace: 50 * 1024 * 1024, // 50MB for workspace backups
};

const VALID_IMPORT_EXTENSIONS = ['csv', 'json'];
const VALID_WORKSPACE_EXTENSIONS = ['json'];

/**
 * Validate a file for data import (CSV or JSON)
 */
export function validateImportFile(file: File): FileValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const size = file.size;
  const sizeMB = size / (1024 * 1024);

  // Check file size
  if (size > FILE_SIZE_LIMITS.hard) {
    errors.push(
      `File too large (${sizeMB.toFixed(1)}MB). Maximum is ${FILE_SIZE_LIMITS.hard / (1024 * 1024)}MB.`
    );
    return { valid: false, warnings, errors, size, sizeMB };
  }

  if (size > FILE_SIZE_LIMITS.soft) {
    warnings.push(
      `Large file (${sizeMB.toFixed(1)}MB). Import may take longer.`
    );
  }

  // Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !VALID_IMPORT_EXTENSIONS.includes(ext)) {
    errors.push(
      `Invalid file type (.${ext}). Use ${VALID_IMPORT_EXTENSIONS.map(e => `.${e}`).join(' or ')} files.`
    );
    return { valid: false, warnings, errors, size, sizeMB };
  }

  // Check if file is empty
  if (size === 0) {
    errors.push('File is empty.');
    return { valid: false, warnings, errors, size, sizeMB };
  }

  return { valid: true, warnings, errors, size, sizeMB };
}

/**
 * Validate a workspace backup file
 */
export function validateWorkspaceBackupFile(file: File): FileValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const size = file.size;
  const sizeMB = size / (1024 * 1024);

  // Check file size
  if (size > FILE_SIZE_LIMITS.workspace) {
    errors.push(
      `Backup file too large (${sizeMB.toFixed(1)}MB). Maximum is ${FILE_SIZE_LIMITS.workspace / (1024 * 1024)}MB.`
    );
    return { valid: false, warnings, errors, size, sizeMB };
  }

  if (size > FILE_SIZE_LIMITS.soft) {
    warnings.push(
      `Large backup file (${sizeMB.toFixed(1)}MB). Import may take longer.`
    );
  }

  // Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !VALID_WORKSPACE_EXTENSIONS.includes(ext)) {
    errors.push(
      `Invalid file type (.${ext}). Workspace backups must be .json files.`
    );
    return { valid: false, warnings, errors, size, sizeMB };
  }

  // Check if file is empty
  if (size === 0) {
    errors.push('File is empty.');
    return { valid: false, warnings, errors, size, sizeMB };
  }

  return { valid: true, warnings, errors, size, sizeMB };
}
