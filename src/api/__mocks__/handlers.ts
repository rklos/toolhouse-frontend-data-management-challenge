import { http, delay, HttpResponse } from 'msw';
import itemsList from './items-list';

export const handlers = [
  http.all('*', async () => {
    await delay(Math.floor(Math.random() * (800 - 200 + 1)) + 200);
  }),
  http.get('/api/items', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ?? '1';
    const pageSize = url.searchParams.get('pageSize') ?? '10';

    const offset = (Number(page) - 1) * Number(pageSize);
    const items = itemsList.slice(offset, offset + Number(pageSize));

    return HttpResponse.json(items);
  }),
];