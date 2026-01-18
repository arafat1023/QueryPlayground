import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { HardDrive, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { storageMonitor, type StorageInfo } from '@/services/storageMonitor';
import { dataCleaner } from '@/services/dataCleaner';
import { toast } from 'sonner';

type ActionMode = 'start-fresh' | 'reset-default' | null;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [actionMode, setActionMode] = useState<ActionMode>(null);

  useEffect(() => {
    if (isOpen) {
      storageMonitor.getStorageInfo().then(setStorageInfo);
    }
  }, [isOpen]);

  const handleStartFresh = async () => {
    setIsClearing(true);
    try {
      await dataCleaner.startFresh({
        preserveTheme: true,
        preservePreferences: true,
      });
      toast.success('Starting fresh with empty database');
      onClose();
    } catch (error) {
      toast.error('Failed to clear data');
      console.error(error);
      setIsClearing(false);
      setActionMode(null);
    }
    // Note: Page will reload from startFresh(), so we don't reset state here
  };

  const handleResetDefault = async () => {
    setIsClearing(true);
    try {
      await dataCleaner.clearAllData({
        preserveTheme: true,
        preservePreferences: true,
      });
      toast.success('Data reset to default successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to reset data');
      console.error(error);
      setIsClearing(false);
      setActionMode(null);
    }
    // Note: Page will reload from clearAllData(), so we don't reset state here
  };

  const handleAction = () => {
    if (actionMode === 'start-fresh') {
      handleStartFresh();
    } else if (actionMode === 'reset-default') {
      handleResetDefault();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-6">
        {/* Storage Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Storage Usage
          </h3>
          {storageInfo && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Used</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {storageMonitor.formatBytes(storageInfo.combined.used)} / {storageMonitor.formatBytes(storageInfo.combined.total)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    storageInfo.combined.percentage > 80
                      ? 'bg-red-500'
                      : storageInfo.combined.percentage > 60
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(storageInfo.combined.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>localStorage: {storageMonitor.formatBytes(storageInfo.localStorage.used)}</span>
                <span>IndexedDB: {storageMonitor.formatBytes(storageInfo.indexedDB.used)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Clear Data Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Data Management
          </h3>

          {/* Confirmation View */}
          {actionMode ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-2">
                {actionMode === 'start-fresh' ? 'Start Fresh' : 'Reset to Default'}
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mb-4">
                {actionMode === 'start-fresh'
                  ? 'This will delete ALL data including default tables. You will start with an empty database to create your own tables.'
                  : 'This will delete all your custom data and reload the default sample data.'
                }
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setActionMode(null)}
                  className="flex-1"
                  disabled={isClearing}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleAction}
                  className="flex-1"
                  isLoading={isClearing}
                  leftIcon={isClearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined}
                >
                  Confirm
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Reset to Default */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                      Reset to Default Data
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
                      Delete all your data and reload the sample tables/collections for practice.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setActionMode('reset-default')}
                      className="w-full"
                      size="sm"
                      leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>
              </div>

              {/* Start Fresh */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Start Fresh
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Delete ALL data including default tables. Start with an empty database to create your own.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => setActionMode('start-fresh')}
                      className="w-full"
                      size="sm"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                      Start Fresh
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
