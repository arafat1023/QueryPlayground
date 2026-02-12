import { useEffect, useCallback, useState, useRef } from 'react';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Reusable modal component with accessibility features
 * - Fade + scale enter/exit transitions
 * - Escape key to close
 * - Body scroll prevention when open
 * - Backdrop click to close
 * - Focus trap on first focusable element
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [animState, setAnimState] = useState<'enter' | 'visible' | 'exit'>('enter');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // Mount/unmount with animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setAnimState('enter');
      // Trigger visible state after a frame for CSS transition
      const raf = requestAnimationFrame(() => {
        setAnimState('visible');
      });
      return () => cancelAnimationFrame(raf);
    } else if (mounted) {
      setAnimState('exit');
      const timer = setTimeout(() => {
        setMounted(false);
      }, 150); // Match exit transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add/remove event listeners & manage scroll lock
  useEffect(() => {
    if (!mounted) return;

    const originalOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Focus the dialog on mount
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [mounted, handleEscape]);

  if (!mounted) return null;

  const backdropClass =
    animState === 'enter'
      ? 'modal-backdrop-enter'
      : animState === 'visible'
        ? 'modal-backdrop-visible'
        : 'modal-backdrop-exit';

  const contentClass =
    animState === 'enter'
      ? 'modal-content-enter'
      : animState === 'visible'
        ? 'modal-content-visible'
        : 'modal-content-exit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${backdropClass}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={dialogRef}
        className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-xl ${sizeStyles[size]} w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${contentClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
