import { useState, useTransition } from 'react';
import type { ApiParams } from '../api/items';

const PAGE_SIZE = 20;

type FilterParams = Omit<ApiParams, 'page' | 'pageSize'>;
type ApiGetter<T> = (params: ApiParams) => Promise<{ items: T[]; total: number }>;

export function usePagination<T extends object>(
  apiGetter: ApiGetter<T>,
  initialParams: ApiParams = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [isLoading, startTransition] = useTransition();
  const [params, setParams] = useState<FilterParams>(initialParams);

  const fetchItems = (opts?: { page?: number; params?: FilterParams }) => {
    const fetchPage = opts?.page ?? page;
    const fetchParams = opts?.params || params;
    startTransition(async () => {
      const res = await apiGetter({
        page: fetchPage,
        pageSize: PAGE_SIZE,
        ...fetchParams,
      });
      setItems(res.items ?? []);
      setMaxPages(Math.max(1, Math.ceil(res.total / PAGE_SIZE)));
    });
  };

  const goToPage = (newPage: number) => {
    const safePage = Math.max(1, Math.min(newPage, maxPages));
    setPage(safePage);
    fetchItems({ page: safePage });
  };

  const updateParams = (newParams: FilterParams) => {
    setParams(newParams);
    setPage(1);
    fetchItems({ page: 1, params: newParams });
  };

  return {
    items,
    isLoading,
    page,
    maxPages,
    goToPage,
    fetchItems,
    setParams: updateParams,
    params,
  };
}
