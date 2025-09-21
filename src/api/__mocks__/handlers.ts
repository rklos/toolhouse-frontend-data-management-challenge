import { http, delay, HttpResponse } from 'msw';
import itemsList from './items-list';
import { sortBy } from './sort';

let localItemsList = [ ...itemsList ];

export const handlers = [
  http.all('*', async () => {
    await delay(Math.floor(Math.random() * (800 - 200 + 1)) + 200);
  }),
  http.get('/api/items', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ?? '1';
    const pageSize = url.searchParams.get('pageSize') ?? '10';
    const sort = url.searchParams.get('sort') ?? 'name:asc';
    const query = url.searchParams.get('query')?.toLowerCase() ?? '';
    const status = url.searchParams.get('status') ?? '';

    const offset = (Number(page) - 1) * Number(pageSize);
    const items = localItemsList
      .filter((item) => !query ||item.name.toLocaleLowerCase().includes(query) || item.description.toLocaleLowerCase().includes(query))
      .filter((item) => !status ||item.status === status)
      .sort(sortBy(sort))
      .slice(offset, offset + Number(pageSize));

    return HttpResponse.json({ items, total: items.length });
  }),
  http.delete('/api/items/:id', ({ params }) => {
    if (Math.random() < 0.1) {
      return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const id = params.id;
    localItemsList = localItemsList.filter((item) => item.id !== id);
    return HttpResponse.json({ success: true });
  }),
  http.patch('/api/items/:id', async ({ request, params }) => {
    if (Math.random() < 0.1) {
      return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const id = params.id;
    const item = localItemsList.find((item) => item.id === id);
    if (!item) {
      return HttpResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    Object.assign(item, { ...(await request.clone().json()) });

    return HttpResponse.json({ success: true });
  }),
];