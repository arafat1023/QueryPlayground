import { useMemo, useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useHistoryStore } from '@/store/historyStore';
import type { DatabaseMode } from '@/types/editor';

interface SaveQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  database: DatabaseMode;
}

const trimPreview = (query: string): string => {
  const singleLine = query.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= 140) return singleLine;
  return singleLine.slice(0, 140) + '...';
};

export function SaveQueryModal({ isOpen, onClose, query, database }: SaveQueryModalProps) {
  const { addSavedQuery } = useHistoryStore();
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName('');
    }
  }, [isOpen]);

  const dbLabel = database === 'postgresql' ? 'PostgreSQL' : 'MongoDB';
  const preview = useMemo(() => trimPreview(query), [query]);
  const canSave = name.trim().length > 0 && query.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    addSavedQuery({ name: name.trim(), query, database });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Query" size="sm">
      <div className="space-y-4">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Saving for <span className="font-medium text-gray-700 dark:text-gray-300">{dbLabel}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Query name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="e.g. Top customers by spend"
          />
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview</p>
          <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
            {preview || 'No query content'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={!canSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
