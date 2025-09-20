import type ky from 'ky';
import type { ItemModel } from '../components/Item';

export async function getList(api: typeof ky, page?: number, pageSize?: number): Promise<{ items: ItemModel[], total: number } | null>  {
  const response = await api.get('items', {
    searchParams: {
      page,
      pageSize,
    },
  });

  if (!response.ok) return null;

  return response.json();
}