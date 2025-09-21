import { useEffect, useCallback, type ReactNode } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  preventCloseOnEscape?: boolean;
  preventCloseOnBackdrop?: boolean;
}

export function BaseModal({
  isOpen,
  onClose,
  children,
  className = '',
  preventCloseOnEscape = false,
  preventCloseOnBackdrop = false,
}: BaseModalProps) {
  // Handle escape key to close modal
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventCloseOnEscape) {
        onClose();
      }
    },
    [onClose, preventCloseOnEscape]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscapeKey]);

  const handleBackdropClick = useCallback(() => {
    if (!preventCloseOnBackdrop) {
      onClose();
    }
  }, [onClose, preventCloseOnBackdrop]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-75"
        onClick={handleBackdropClick}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white text-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 ${className}`}>
        {children}
      </div>
    </div>
  );
}
