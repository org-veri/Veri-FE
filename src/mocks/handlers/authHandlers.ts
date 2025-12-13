import { http, HttpResponse, delay } from 'msw';
import { createMockResponse, mockTokens } from '../data';

const withDelay = async <T>(body: T) => {
  await delay(200);
  return HttpResponse.json(body as any);
};

export const authHandlers = [
  http.get('*/api/v1/oauth2/:provider', async () => {
    const body = createMockResponse({
      accessToken: mockTokens.accessToken,
      refreshToken: mockTokens.refreshToken,
    }, 'Mock 소셜 로그인 성공');
    return withDelay(body);
  }),
  http.get('*/api/v1/oauth2/test-token', async () => {
    const body = createMockResponse(
      { accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken },
      'Mock 테스트 토큰 발급 성공');
    return withDelay(body);
  }),
  http.post('*/api/v1/auth/reissue', async () => {
    const body = createMockResponse(
      { accessToken: mockTokens.accessToken },
      'Mock 토큰 재발급 성공'
    );
    return withDelay(body);
  }),
];
