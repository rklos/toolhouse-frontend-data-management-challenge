import { useEffect, useCallback, useState } from 'react';
import { List } from './List';
import type { ItemModel } from './Item';
import { usePagination } from '../hooks/use-pagination';
import api from '../api';
import { Button } from './Button';

export function PaginatedList() {
  const [localItems, setLocalItems] = useState<ItemModel[]>([]);
  const { maxPages, page, isLoading, setPage, fetchItems, nextPage, previousPage } = usePagination({
    apiGetter: api.items.getList,
    onItemsChange: setLocalItems,
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

  return (
    <>
      <div className="relative">
        { isLoading && <div className="absolute inset-0 flex justify-center items-center backdrop-blur-xs" /> }
        <List items={localItems} onDelete={handleDelete} onSave={handleSave} />
      </div>
      <section className="flex justify-center p-4 gap-2">
        <Button onClick={previousPage} disabled={page === 1}>Previous</Button>
        {Array.from({ length: maxPages }).map((_, index) => (
          <Button key={index} onClick={() => setPage(index + 1)} active={page === index + 1}>{index + 1}</Button>
        ))}
        <Button onClick={nextPage} disabled={page === maxPages}>Next</Button>
      </section>
    </>
  );
}
