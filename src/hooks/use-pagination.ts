import { useState, useTransition, useReducer } from 'react';

const PAGE_SIZE = 20;

interface Props<T extends object> {
  apiGetter: (page: number, pageSize: number) => Promise<{ items: T[], total: number }>;
  onItemsChange: (items: T[]) => void;
}

export function usePagination<T extends object>({ apiGetter, onItemsChange }: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
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
      const res = await apiGetter(p ?? page, PAGE_SIZE);

      // HACK: https://react.dev/reference/react/useTransition#react-doesnt-treat-my-state-update-after-await-as-a-transition
      startTransition(() => {
        const newItems = res.items ?? [];
        setItems(newItems);
        setMaxPages(Math.ceil(res.total / PAGE_SIZE));
        onItemsChange(newItems);
      });
    });
  };

  const onPageChange = (newPage: number) => {
    setPage(newPage);
    fetchItems(newPage);
  };

  const nextPage = () => {
    onPageChange(page + 1);
  };

  const previousPage = () => {
    onPageChange(page - 1);
  };

  return {
    items,
    isLoading,
    page,
    maxPages,
    nextPage,
    previousPage,
    setPage: onPageChange,
    fetchItems,
  };
}
