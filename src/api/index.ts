import ky from 'ky';
import {
  getList as itemsGetList,
  deleteItem as itemsDeleteItem,
  saveItem as itemsSaveItem,
  addItem as itemsAddItem,
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
    getList: (params: Parameters<typeof itemsGetList>[1]) => itemsGetList(api, params),
    deleteItem: (id: string) => itemsDeleteItem(api, id),
    saveItem: (item: Parameters<typeof itemsSaveItem>[1]) => itemsSaveItem(api, item),
    addItem: (item: Parameters<typeof itemsAddItem>[1]) => itemsAddItem(api, item),
  }
};