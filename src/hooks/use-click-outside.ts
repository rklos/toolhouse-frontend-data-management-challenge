import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside<T extends HTMLElement>(
  handler: Handler
): { ref: RefObject<T | null>, focused: boolean, blur: () => void } {
  const ref = useRef<T | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) {
        setFocused(true);
        return;
      }

      setFocused(false)
      handler(event);
    }

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  const blur = () => {
    setFocused(false);
  };  

  return { ref, focused, blur };
}
