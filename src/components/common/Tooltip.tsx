import type { ReactNode } from 'react';

type TooltipPosition = 'top' | 'bottom';

interface TooltipProps {
  /** The content to display inside the tooltip */
  label: string;
  /** Position of the tooltip relative to the child */
  position?: TooltipPosition;
  /** The child element that triggers the tooltip on hover */
  children: ReactNode;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * Lightweight CSS-only tooltip component.
 * Uses .tooltip-* classes from index.css for positioning & animation.
 */
export function Tooltip({
  label,
  position = 'bottom',
  children,
  className = '',
}: TooltipProps) {
  const positionClass = position === 'top' ? 'tooltip-top' : 'tooltip-bottom';

  return (
    <div className={`tooltip-container inline-flex ${className}`}>
      {children}
      <span className={`tooltip-content ${positionClass}`} role="tooltip">
        {label}
      </span>
    </div>
  );
}

