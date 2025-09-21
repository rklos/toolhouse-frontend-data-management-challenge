import { useEffect, useCallback, useState } from 'react';
import { List } from './List';
import { usePagination } from '../../hooks/use-pagination';
import api from '../../api';
import { Button } from '../common/Button';
import { Filters } from './Filters';
import { Toast } from '../common/Toast';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { AddItemModal } from './AddItemModal';
import type { Item, ItemUpdatePayload } from '../../api/items';

export function PaginatedList() {
  const [localItems, setLocalItems] = useState<Item[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newItemId, setNewItemId] = useState<string>('');
  const [addModal, setAddModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemName: string;
  }>({
    isOpen: false,
    itemId: null,
    itemName: '',
  });

  const {
    items,
    maxPages,
    page,
    isLoading,
    goToPage,
    fetchItems,
    params,
    setParams,
  } = usePagination(api.items.getList);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalItems(items);
  }, [items])

  const handleDeleteRequest = useCallback(
    (id: string) => {
      const item = localItems.find(item => item.id === id);
      if (item) {
        setDeleteModal({
          isOpen: true,
          itemId: id,
          itemName: item.name,
        });
      }
    },
    [localItems]
  );

  const handleDeleteConfirm = useCallback(
    async () => {
      if (!deleteModal.itemId) return;
      
      try {
        await api.items.deleteItem(deleteModal.itemId);
        setLocalItems((items) => items.filter((item) => item.id !== deleteModal.itemId));
        setDeleteModal({ isOpen: false, itemId: null, itemName: '' });
      } catch {
        setToastMessage('Failed to delete item. Please try again.');
        setDeleteModal({ isOpen: false, itemId: null, itemName: '' });
      }
    },
    [deleteModal.itemId]
  );

  const handleDeleteCancel = useCallback(() => {
    setDeleteModal({ isOpen: false, itemId: null, itemName: '' });
  }, []);

  const handleAddItem = useCallback(async (itemData: { name: string; description: string; status: 'active' | 'archived' | 'draft' }) => {
    try {
      const response = await api.items.addItem(itemData);
      const newItem = response.item;

      // Add the new item at the beginning of the list
      setLocalItems(prevItems => [newItem, ...prevItems]);
      
      // Mark it as new for animation
      setNewItemId(newItem.id);
      
      // Remove the new item animation after 3 seconds
      setTimeout(() => {
        setNewItemId('');
      }, 3000);
    } catch (error) {
      setToastMessage('Failed to add item. Please try again.');
      throw error; // Re-throw to let the modal handle the error state
    }
  }, []);

  const handleAddModalOpen = useCallback(() => {
    setAddModal(true);
  }, []);

  const handleAddModalClose = useCallback(() => {
    setAddModal(false);
  }, []);

  const handleSave = useCallback(
    async (item: ItemUpdatePayload) => {
      try {
        await api.items.saveItem(item);
        return true;
      } catch {
        setToastMessage('Failed to save item. Please try again.');
        return false;
      }
    },
    []
  );

  const updateApiParamsAndFetch = useCallback(
    (newParams: Partial<typeof params>) => {
      const updatedParams = { ...params, ...newParams };
      setParams(updatedParams);
      fetchItems({ page, params: updatedParams });
    },
    [params, fetchItems, page, setParams]
  );

  const handleSort = useCallback(
    (sort: string) => updateApiParamsAndFetch({ sort }),
    [updateApiParamsAndFetch]
  );

  const handleSearch = useCallback(
    (query: string) => updateApiParamsAndFetch({ query }),
    [updateApiParamsAndFetch]
  );

  const handleStatusChange = useCallback(
    (status: string) => updateApiParamsAndFetch({ status }),
    [updateApiParamsAndFetch]
  );

  const pages = Array.from({ length: maxPages }, (_, i) => i + 1);

  const clearToast = () => setToastMessage(null);

  return (
    <>
      <div className="relative">
        { isLoading && <div className="absolute inset-0 flex justify-center items-center backdrop-blur-xs" /> }
        <div className="flex justify-between items-center mb-4">
          <Filters onSearch={handleSearch} onStatusChange={handleStatusChange} />
          <Button onClick={handleAddModalOpen} className="bg-green-600 hover:bg-green-700 text-white border-green-600">
            + Add Item
          </Button>
        </div>
        <List items={localItems} onDelete={handleDeleteRequest} onSave={handleSave} onSort={handleSort} newItemId={newItemId} />
      </div>
      <section className="flex justify-center p-4 gap-2">
        <Button onClick={() => goToPage(page - 1)} disabled={page === 1}>Previous</Button>
        {pages.map((pageNumber) => (
          <Button key={pageNumber} onClick={() => goToPage(pageNumber)} active={page === pageNumber}>{pageNumber}</Button>
        ))}
        <Button onClick={() => goToPage(page + 1)} disabled={page === maxPages}>Next</Button>
      </section>
      {toastMessage && (
        <Toast
          text={toastMessage}
          onClose={clearToast}
        />
      )}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteModal.itemName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      <AddItemModal
        isOpen={addModal}
        onClose={handleAddModalClose}
        onAdd={handleAddItem}
      />
    </>
  );
}
