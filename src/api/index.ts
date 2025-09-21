import ky from 'ky';
import {
  getList as itemsGetList,
  deleteItem as itemsDeleteItem,
  saveItem as itemsSaveItem,
} from './items';
import type { ItemModel } from '../components/Item';

const api = ky.create({
  prefixUrl: 'http://localhost:5173/api',
  timeout: 30 * 1000,
  credentials: 'include',
  throwHttpErrors: false,
});

export default {
  api,
  items: {
    getList: async (params: {
      page?: number;
      pageSize?: number;
      sort?: string;
      query?: string;
      status?: string;
    }) => itemsGetList(api, params),
    deleteItem: async (id: string) => itemsDeleteItem(api, id),
    saveItem: async (item: Partial<ItemModel> & { id: string }) => itemsSaveItem(api, item),
  }
};