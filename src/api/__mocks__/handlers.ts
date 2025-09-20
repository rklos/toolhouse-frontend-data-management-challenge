import { http, HttpResponse } from 'msw';
import itemsList from './items-list';

export const handlers = [
  http.get('/api/items', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ?? '1';
    const limit = url.searchParams.get('limit') ?? '10';

    const offset = (Number(page) - 1) * Number(limit);
    const items = itemsList.slice(offset, offset + Number(limit));

    return HttpResponse.json(items);
  }),
];