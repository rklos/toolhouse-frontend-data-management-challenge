import ky from 'ky';
import { getList as itemsGetList } from './items';

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
  }
};