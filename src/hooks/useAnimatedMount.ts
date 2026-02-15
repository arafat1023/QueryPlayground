import { useState, useEffect, useRef } from 'react';

/**
 * Reusable hook for mount/unmount animations.
 * Returns `mounted` (whether to render) and `animState` (CSS class phase).
 */
export function useAnimatedMount(isOpen: boolean, exitDuration = 200) {
  const [mounted, setMounted] = useState(false);
  const [animState, setAnimState] = useState<'enter' | 'visible' | 'exit'>('enter');
  const mountedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      mountedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      setAnimState('enter');
      const raf = requestAnimationFrame(() => {
        setAnimState('visible');
      });
      return () => cancelAnimationFrame(raf);
    } else if (mountedRef.current) {
      setAnimState('exit');
      const timer = setTimeout(() => {
        mountedRef.current = false;
        setMounted(false);
      }, exitDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, exitDuration]);

  return { mounted, animState } as const;
}
