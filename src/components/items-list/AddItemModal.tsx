import { useState, useCallback, useEffect } from 'react';
import { Button } from '../common/Button';
import { BaseModal } from '../common/BaseModal';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { name: string; description: string; status: 'active' | 'archived' | 'draft' }) => Promise<void>;
}

export function AddItemModal({ isOpen, onClose, onAdd }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'archived' | 'draft'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', description: '', status: 'active' });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: 'name' | 'description' | 'status') => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(formData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Failed to add item:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onAdd, onClose]);

  const handleCancel = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={handleCancel}
      preventCloseOnEscape={isSubmitting}
      preventCloseOnBackdrop={isSubmitting}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Add New Item
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter item name"
            required
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <input
            id="description"
            type="text"
            value={formData.description}
            onChange={handleInputChange('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter item description"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={handleInputChange('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 border-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {}} // Form submission is handled by onSubmit
            disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
