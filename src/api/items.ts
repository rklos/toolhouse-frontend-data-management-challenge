import type ky from 'ky';
import type { ItemModel } from '../components/Item';

export async function getList(api: typeof ky, page?: number, pageSize?: number): Promise<{ items: ItemModel[], total: number }>  {
  const response = await api.get('items', {
    searchParams: {
      page,
      pageSize,
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
