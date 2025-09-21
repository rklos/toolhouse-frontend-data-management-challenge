import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside<T extends HTMLElement>(
  handler: Handler
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    }

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
}
