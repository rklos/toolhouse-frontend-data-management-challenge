import type ky from 'ky';
import type { ItemModel } from '../components/Item';

export async function getList(api: typeof ky, params: {
  page?: number;
  pageSize?: number;
  sort?: string;
  query?: string;
  status?: string;
}): Promise<{ items: ItemModel[], total: number }>  {
  const response = await api.get('items', {
    searchParams: {
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      query: params.query,
      status: params.status,
    },
  });

  // TODO: create dedicated error class
  if (!response.ok) throw new Error();

  return response.json();
}

export async function deleteItem(api: typeof ky, id: string): Promise<void> {
  const response = await api.delete('items/' + id);

  // TODO: create dedicated error class
  if (!response.ok) throw new Error();
}

export async function saveItem(api: typeof ky, item: Partial<ItemModel> & { id: string }): Promise<void> {
  const response = await api.patch('items/' + item.id, {
    json: item,
  });

  // TODO: create dedicated error class
  if (!response.ok) throw new Error();
}
