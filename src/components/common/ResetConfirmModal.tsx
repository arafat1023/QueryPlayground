import { AlertTriangle, Check } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Confirmation modal for resetting data to default
 * Shows warning and preserves preferences
 */
export function ResetConfirmModal({ isOpen, onClose, onConfirm, isLoading = false }: ResetConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset to Default Data" size="sm" closeOnBackdrop={false}>
      <div className="space-y-4">
        {/* Warning Message */}
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-300">
              This action cannot be undone
            </p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1">
              All your custom data will be permanently deleted and replaced with default sample data.
            </p>
          </div>
        </div>

        {/* What Will Happen */}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">This will:</p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">×</span>
              <span>Delete all custom tables and collections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">×</span>
              <span>Delete all custom data you have added</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Reload default sample data</span>
            </li>
          </ul>
        </div>

        {/* What Will Be Preserved */}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">This will preserve:</p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Your theme preference</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Panel sizes and layout</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Active database mode selection</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Your Gemini API key (if set)</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            className="flex-1"
            isLoading={isLoading}
          >
            Reset Data
          </Button>
        </div>
      </div>
    </Modal>
  );
}
