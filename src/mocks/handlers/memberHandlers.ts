import { http, HttpResponse, delay } from 'msw';
import { createMockResponse, mockUser } from '../data';

const withDelay = async <T>(payload: T) => {
  await delay(150);
  return HttpResponse.json(payload as any);
};

const safeJson = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
};

export const memberHandlers = [
  http.get('*/api/v1/members/me', async () => {
    const body = createMockResponse(mockUser, 'Mock 사용자 프로필 조회 성공');
    return withDelay(body);
  }),
  http.patch('*/api/v1/members/me/info', async ({ request }) => {
    const payload = await safeJson<Partial<{ nickname: string; profileImageUrl: string }>>(request);
    const updated = {
      id: 1,
      nickname: payload.nickname || mockUser.nickname,
      image: payload.profileImageUrl || mockUser.image,
    };
    const body = createMockResponse(updated, 'Mock 내 정보 수정 성공');
    return withDelay(body);
  }),
  http.get('*/api/v1/members/nickname/exists', async () => {
    const body = createMockResponse(false, 'Mock 닉네임 중복 확인 성공');
    return withDelay(body);
  }),
];
