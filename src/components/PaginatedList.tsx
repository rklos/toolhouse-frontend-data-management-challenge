import { useEffect, useCallback, useState } from 'react';
import { List } from './List';
import { usePagination } from '../hooks/use-pagination';
import api from '../api';
import { Button } from './Button';
import { Filters } from './Filters';
import { Toast } from './Toast';
import type { Item, ItemUpdatePayload } from '../api/items';

export function PaginatedList() {
  const [localItems, setLocalItems] = useState<Item[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await api.items.deleteItem(id);
        setLocalItems((items) => items.filter((item) => item.id !== id));
      } catch {
        setToastMessage('Failed to delete item. Please try again.');
      }
    },
    []
  );

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
        <Filters onSearch={handleSearch} onStatusChange={handleStatusChange} />
        <List items={localItems} onDelete={handleDelete} onSave={handleSave} onSort={handleSort} />
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
    </>
  );
}
