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
    getList: async (page?: number, pageSize?: number) => itemsGetList(api, page, pageSize),
    deleteItem: async (id: string) => itemsDeleteItem(api, id),
    saveItem: async (item: Partial<ItemModel> & { id: string }) => itemsSaveItem(api, item),
  }
};