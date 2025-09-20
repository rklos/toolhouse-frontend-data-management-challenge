import type ky from 'ky';
import type { ItemModel } from '../components/Item';

export async function getList(api: typeof ky, page?: number, limit?: number): Promise<ItemModel[] | null>  {
  const response = await api.get('items', {
    searchParams: {
      page,
      limit,
    },
  });

  if (!response.ok) return null;

  return response.json();
}