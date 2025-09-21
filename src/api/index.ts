import ky from 'ky';
import {
  getList as itemsGetList,
  deleteItem as itemsDeleteItem,
  saveItem as itemsSaveItem,
} from './items';

const api = ky.create({
  prefixUrl: 'http://localhost:5173/api',
  timeout: 30 * 1000,
  credentials: 'include',
  throwHttpErrors: false,
});

export default {
  api,
  items: {
    getList: async (params: Parameters<typeof itemsGetList>[1]) => itemsGetList(api, params),
    deleteItem: async (id: string) => itemsDeleteItem(api, id),
    saveItem: async (item: Parameters<typeof itemsSaveItem>[1]) => itemsSaveItem(api, item),
  }
};