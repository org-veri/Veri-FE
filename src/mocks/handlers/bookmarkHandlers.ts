import { http, HttpResponse, delay } from 'msw';
import { createMockResponse, mockBookmarks } from '../data';

const bookmarks = mockBookmarks.map(bookmark => ({ ...bookmark }));

const withDelay = async <T>(payload: T) => {
  await delay(150);
  return HttpResponse.json(payload as any);
};

export const bookmarkHandlers = [
  http.get('*/api/v1/bookmarks', async () => {
    const body = createMockResponse(bookmarks, 'Mock 북마크 조회 성공');
    return withDelay(body);
  }),
];
