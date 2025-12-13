import { http, HttpResponse, delay } from 'msw';
import { createMockResponse, mockImageUrl, mockOcrResult } from '../data';

const withDelay = async <T>(payload: T) => {
  await delay(200);
  return HttpResponse.json(payload as any);
};

export const imageHandlers = [
  http.post('*/api/v0/images/ocr', async () => {
    const body = createMockResponse(mockOcrResult, 'Mock OCR 성공');
    return withDelay(body);
  }),
  http.post('*/api/v1/images/upload', async () => {
    const body = createMockResponse({ url: mockImageUrl }, 'Mock 이미지 업로드 성공');
    return withDelay(body);
  }),
];
