import { useEffect, useCallback, useState } from 'react';
import { List } from './List';
import type { ItemModel } from './Item';
import { usePagination } from '../hooks/use-pagination';
import api from '../api';
import { Button } from './Button';

export function PaginatedList() {
  const [localItems, setLocalItems] = useState<ItemModel[]>([]);
  const [apiParams, setApiParams] = useState<{
    page?: number;
    pageSize?: number;
    sort?: string;
    query?: string;
    status?: string;
  }>({});
  const { maxPages, page, isLoading, setPage, fetchItems, nextPage, previousPage } = usePagination({
    apiGetter: api.items.getList,
    onItemsChange: setLocalItems,
    apiParams,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await api.items.deleteItem(id)
    setLocalItems(localItems.filter((item) => item.id !== id));
  }, [localItems]);

  const handleSave = useCallback((item: Partial<ItemModel> & { id: string }) => {
    api.items.saveItem(item);
    return true;
  }, []);

  const handleSort = useCallback((sort: string) => {
    const newApiParams = { ...apiParams, sort };
    setApiParams(newApiParams);
    fetchItems(page, newApiParams);
  }, [fetchItems, page, apiParams]);

  const pages = Array.from({ length: maxPages }).map((_, index) => index + 1);

  return (
    <>
      <div className="relative">
        { isLoading && <div className="absolute inset-0 flex justify-center items-center backdrop-blur-xs" /> }
        <List items={localItems} onDelete={handleDelete} onSave={handleSave} onSort={handleSort} />
      </div>
      <section className="flex justify-center p-4 gap-2">
        <Button onClick={previousPage} disabled={page === 1}>Previous</Button>
        {pages.map((pageNumber) => (
          <Button key={pageNumber} onClick={() => setPage(pageNumber)} active={page === pageNumber}>{pageNumber}</Button>
        ))}
        <Button onClick={nextPage} disabled={page === maxPages}>Next</Button>
      </section>
    </>
  );
}
