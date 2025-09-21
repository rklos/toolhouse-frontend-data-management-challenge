import { Button } from './Button';
import { BaseModal } from './BaseModal';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onCancel}>
      <h3 className="text-lg font-semibold mb-4">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      
      <div className="flex justify-end gap-3">
        <Button
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-300 border-gray-300"
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white border-red-600"
        >
          {confirmText}
        </Button>
      </div>
    </BaseModal>
  );
}
