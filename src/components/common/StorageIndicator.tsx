import { useEffect, useState } from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { storageMonitor } from '@/services/storageMonitor';

export function StorageIndicator() {
  const [usage, setUsage] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const updateUsage = async () => {
      const info = await storageMonitor.getStorageInfo();
      setUsage(info.combined.percentage);
      setShowWarning(await storageMonitor.isNearQuotaLimit(80));
    };

    updateUsage();
    const interval = setInterval(updateUsage, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  if (usage < 70) return null; // Only show when >70% full

  return (
    <button
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      title={`Storage: ${usage.toFixed(1)}% used`}
      aria-label="Storage usage"
    >
      {showWarning ? (
        <AlertTriangle className="w-5 h-5 text-amber-500" />
      ) : (
        <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
      <span className="sr-only">{usage.toFixed(0)}% used</span>
    </button>
  );
}
