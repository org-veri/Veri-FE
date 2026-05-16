import { http, HttpResponse, delay } from 'msw';
import { createMockResponse } from '../data';

const withDelay = async <T>(payload: T) => {
  await delay(150);
  return HttpResponse.json(payload as any);
};

let commentCounter = 1000;

export const communityCommentsHandlers = [
  http.post('*/api/comments', async () => {
    const body = createMockResponse({ commentId: ++commentCounter }, 'Mock 댓글 작성 성공');
    return withDelay(body);
  }),
  http.delete('*/api/comments/:commentId', async () => {
    const body = createMockResponse({}, 'Mock 댓글 삭제 성공');
    return withDelay(body);
  }),
  http.patch('*/api/comments/:commentId', async () => {
    const body = createMockResponse({}, 'Mock 댓글 수정 성공');
    return withDelay(body);
  }),
  http.post('*/api/comments/reply', async () => {
    const body = createMockResponse({ commentId: ++commentCounter }, 'Mock 대댓글 작성 성공');
    return withDelay(body);
  }),
];
