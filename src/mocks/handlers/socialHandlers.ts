import { http, HttpResponse, delay } from 'msw';
import { createMockResponse, mockCommunityPosts, mockUser } from '../data';

const withDelay = async <T>(payload: T) => {
  await delay(200);
  return HttpResponse.json(payload as any);
};

const paginate = <T>(items: T[], page: number, size: number) => {
  const start = (page - 1) * size;
  return items.slice(start, start + size);
};

const mockPublicProfile = (memberId: number) => ({
  id: memberId,
  nickname: memberId === 201 ? '김현아' : memberId === 202 ? '김세원' : `회원${memberId}`,
  bio: '독서를 좋아하는 사람입니다.',
  postCount: 16,
  followerCount: 53,
  followingCount: 12,
  following: false,
  followedBy: memberId === 202,
  image: '/images/profileSample/sample_user.png',
  numOfReadBook: 24,
  numOfCard: 8,
});

export const socialHandlers = [
  http.get('*/api/social/members/:memberId', async ({ params }) => {
    const memberId = Number(params.memberId);
    const body = createMockResponse(mockPublicProfile(memberId), 'Mock 타인 프로필 조회 성공');
    return withDelay(body);
  }),
  http.get('*/api/social/members/:memberId/posts', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const size = Number(url.searchParams.get('size') || '10');
    const posts = paginate(mockCommunityPosts(), page, size);
    const body = createMockResponse(
      {
        posts,
        page,
        size,
        totalElements: mockCommunityPosts().length,
        totalPages: Math.ceil(mockCommunityPosts().length / size) || 1,
      },
      'Mock 타인 게시글 조회 성공'
    );
    return withDelay(body);
  }),
  http.get('*/api/social/members/:memberId/follow', async () => {
    const body = createMockResponse({ following: false }, 'Mock 팔로우 상태 조회 성공');
    return withDelay(body);
  }),
  http.post('*/api/social/members/:memberId/follow', async () => {
    const body = createMockResponse({}, 'Mock 팔로우 성공');
    return withDelay(body);
  }),
  http.delete('*/api/social/members/:memberId/follow', async () => {
    const body = createMockResponse({}, 'Mock 언팔로우 성공');
    return withDelay(body);
  }),
  http.get('*/api/social/members/followers', async () => {
    const body = createMockResponse({ friends: [] }, 'Mock 팔로워 목록 조회 성공');
    return withDelay(body);
  }),
  http.get('*/api/social/members/following', async () => {
    const body = createMockResponse(
      {
        friends: [
          {
            id: 201,
            nickname: '김현아',
            image: mockUser.image,
            numOfReadBook: 10,
            numOfCard: 5,
          },
        ],
      },
      'Mock 팔로잉 목록 조회 성공'
    );
    return withDelay(body);
  }),
];
