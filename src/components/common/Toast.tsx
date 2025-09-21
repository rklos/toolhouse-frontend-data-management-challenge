import { useEffect, useState } from 'react';
import cn from 'classnames';

interface ToastProps {
  text: string;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ text, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger show animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // Trigger hide animation
    const hideTimer = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to complete before calling onClose
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg',
        'bg-red-600 text-white text-sm font-medium',
        'transform transition-all duration-300 ease-in-out',
        {
          'translate-x-0 opacity-100': isVisible && !isExiting,
          'translate-x-full opacity-0': !isVisible || isExiting,
        }
      )}
      style={{
        transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible && !isExiting ? 1 : 0,
      }}
    >
      {text}
    </div>
  );
}
