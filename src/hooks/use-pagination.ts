import { useState, useTransition, useReducer } from 'react';

const PAGE_SIZE = 20;

interface Props<T extends object> {
  apiParams?: {
    sort?: string;
    query?: string;
    status?: string;
  };
  apiGetter: (params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    query?: string;
    status?: string;
  }) => Promise<{ items: T[], total: number }>;
  onItemsChange: (items: T[]) => void;
}

export function usePagination<T extends object>({ apiGetter, onItemsChange, apiParams }: Props<T>) {
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

  const fetchItems = (p?: number, params?: Props<T>['apiParams']) => {
    startTransition(async () => {
      const res = await apiGetter({
        page: p ?? page,
        pageSize: PAGE_SIZE,
        sort: params?.sort ?? apiParams?.sort,
        query: params?.query ?? apiParams?.query,
        status: params?.status ?? apiParams?.status,
      });

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
