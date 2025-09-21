import type ky from 'ky';

export interface Item {
  id: string; // uuid
  name: string;
  description: string;
  createdAt: string; // ISO date string
  status: 'active' | 'archived' | 'draft';
}

export type ItemUpdatePayload = Partial<Item> & { id: string };

export interface ApiParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  query?: string;
  status?: string;
}

export async function getList(api: typeof ky, params: ApiParams): Promise<{ items: Item[], total: number }>  {
  const response = await api.get('items', {
    searchParams: {
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      query: params.query,
      status: params.status,
    },
  });

  if (!response.ok) throw new Error();

  return response.json();
}

export async function deleteItem(api: typeof ky, id: string): Promise<void> {
  const response = await api.delete('items/' + id);

  if (!response.ok) throw new Error();
}

export async function saveItem(api: typeof ky, item: ItemUpdatePayload): Promise<void> {
  const response = await api.patch('items/' + item.id, {
    json: item,
  });

  if (!response.ok) throw new Error();
}

export async function addItem(api: typeof ky, item: Omit<Item, 'id' | 'createdAt'>): Promise<{ item: Item }> {
  const response = await api.post('items', {
    json: item,
  });

  if (!response.ok) throw new Error();

  return response.json();
}
