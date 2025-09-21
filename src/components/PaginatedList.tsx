import { useState, useReducer, useEffect, useCallback, useTransition } from 'react';
import { List } from './List';
import type { ItemModel } from './Item';
import api from '../api';
import { Button } from './Button';

const PAGE_SIZE = 20;

export function PaginatedList() {
  const [items, setItems] = useState<ItemModel[]>([]);
  const [maxPages, setMaxPages] = useState(1);
  const [isLoading, startTransition] = useTransition();
  const [page, setPage] = useReducer((_, newPage: number) => {
    let newState = newPage;

    if (newState < 1) {
      newState = 1;
    } else if (newState > maxPages) {
      newState = maxPages;
    }

    return newState;
  }, 1);

  const fetchItems = (p?: number) => {
    startTransition(async () => {
      const res = await api.items.getList(p ?? page, PAGE_SIZE);

      // HACK: https://react.dev/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-a-transition
      startTransition(() => {
        setItems(res.items ?? []);
        setMaxPages(Math.ceil(res.total / PAGE_SIZE));
      });
    });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await api.items.deleteItem(id)
    setItems(items.filter((item) => item.id !== id));
  }, [items]);

  const handleSave = useCallback((item: Partial<ItemModel> & { id: string }) => {
    api.items.saveItem(item);
    return true;
  }, []);

  const onPageChange = (newPage: number) => {
    setPage(newPage);
    fetchItems(newPage);
  };

  return (
    <>
      <div className="relative">
        { isLoading && <div className="absolute inset-0 flex justify-center items-center backdrop-blur-xs" /> }
        <List items={items} onDelete={handleDelete} onSave={handleSave} />
      </div>
      <section className="flex justify-center p-4 gap-2">
        <Button onClick={() => onPageChange(page - 1)} disabled={page === 1}>Previous</Button>
        {Array.from({ length: maxPages }).map((_, index) => (
          <Button key={index} onClick={() => onPageChange(index + 1)} active={page === index + 1}>{index + 1}</Button>
        ))}
        <Button onClick={() => onPageChange(page + 1)} disabled={page === maxPages}>Next</Button>
      </section>
    </>
  );
}
