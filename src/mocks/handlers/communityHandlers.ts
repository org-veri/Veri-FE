import { http, HttpResponse, delay } from 'msw';
import { createMockResponse, mockCommunityCards, mockCommunityPosts } from '../data';

let posts = mockCommunityPosts();
let cards = mockCommunityCards();

const withDelay = async <T>(payload: T) => {
  await delay(200);
  return HttpResponse.json(payload as any);
};

const safeJson = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
};

const paginate = <T>(items: T[], page: number, size: number) => {
  const start = (page - 1) * size;
  const end = start + size;
  return items.slice(start, end);
};

const buildPostDetail = (postId: number) => {
  const post = posts.find(item => item.postId === postId);
  if (!post) {
    return null;
  }
  return {
    ...post,
    images: post.thumbnail ? [post.thumbnail] : [],
    isLiked: Boolean(post.isLiked),
    comments: [
      {
        commentId: 1,
        content: '정말 좋은 글이네요!',
        author: {
          id: 10,
          nickname: '댓글러',
          profileImageUrl: '/images/profileSample/sample_user.png',
        },
        createdAt: '2024-01-16T09:15:00Z',
        isDeleted: false,
        replies: [
          {
            commentId: 3,
            content: '저도 그렇게 생각해요!',
            author: {
              id: 12,
              nickname: '독서광',
              profileImageUrl: '/images/profileSample/sample_user.png',
            },
            createdAt: '2024-01-16T09:30:00Z',
            isDeleted: false,
            parentCommentId: 1,
          },
        ],
      },
      {
        commentId: 2,
        content: '저도 이 책 읽어보고 싶어요.',
        author: {
          id: 11,
          nickname: '독서러버',
          profileImageUrl: '/images/profileSample/sample_user.png',
        },
        createdAt: '2024-01-16T10:30:00Z',
        isDeleted: false,
        replies: [],
      },
    ],
  };
};

export const communityHandlers = [
  http.get('*/api/v1/posts', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const size = Number(url.searchParams.get('size') || '10');
    const paginated = paginate(posts, page, size);
    const body = createMockResponse({
      posts: paginated,
      page,
      size,
      totalElements: posts.length,
      totalPages: Math.ceil(posts.length / size) || 1,
    }, 'Mock 전체 게시글 조회 성공');
    return withDelay(body);
  }),
  http.get('*/api/v1/cards', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const size = Number(url.searchParams.get('size') || '10');
    const paginated = paginate(cards, page, size);
    const body = createMockResponse({
      cards: paginated,
      page,
      size,
      totalElements: cards.length,
      totalPages: Math.ceil(cards.length / size) || 1,
    }, 'Mock 전체 카드 조회 성공');
    return withDelay(body);
  }),
  http.get('*/api/v1/posts/:postId', async ({ params }) => {
    const detail = buildPostDetail(Number(params.postId));
    const body = createMockResponse(detail, detail ? 'Mock 게시글 상세 조회 성공' : 'Mock 게시글 없음');
    return withDelay(body);
  }),
  http.get('*/api/v1/posts/my', async () => {
    const owned = posts.slice(0, 2);
    const body = createMockResponse({ posts: owned, count: owned.length }, 'Mock 내 게시글 조회 성공');
    return withDelay(body);
  }),
  http.post('*/api/v1/posts', async ({ request }) => {
    const payload = await safeJson<Partial<{ title: string; content: string; images: string[] }>>(request);
    const newId = posts.length ? Math.max(...posts.map(post => post.postId)) + 1 : 1;
    const newPost = {
      postId: newId,
      title: payload.title ?? '새 게시글',
      content: payload.content ?? '',
      thumbnail: payload.images?.[0] ?? null,
      author: {
        id: 999,
        nickname: '나',
        profileImageUrl: '/images/profileSample/sample_user.png',
      },
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      isPublic: true,
    };
    posts = [newPost, ...posts];
    const body = createMockResponse(newId, 'Mock 게시글 작성 성공');
    return withDelay(body);
  }),
  http.patch('*/api/v1/posts/:postId', async ({ request, params }) => {
    const payload = await safeJson<Partial<{ title: string; content: string; images: string[] }>>(request);
    const post = posts.find(item => item.postId === Number(params.postId));
    if (post) {
      post.title = payload.title ?? post.title;
      post.content = payload.content ?? post.content;
      post.thumbnail = payload.images?.[0] ?? post.thumbnail;
    }
    const body = createMockResponse({}, 'Mock 게시글 수정 성공');
    return withDelay(body);
  }),
  http.delete('*/api/v1/posts/:postId', async ({ params }) => {
    posts = posts.filter(post => post.postId !== Number(params.postId));
    const body = createMockResponse({}, 'Mock 게시글 삭제 성공');
    return withDelay(body);
  }),
  http.post('*/api/v1/posts/like/:postId', async ({ params }) => {
    const post = posts.find(item => item.postId === Number(params.postId));
    if (post) {
      post.likeCount += 1;
      post.isLiked = true;
    }
    const body = createMockResponse({ likeCount: post?.likeCount ?? 1, isLiked: true }, 'Mock 게시글 좋아요 성공');
    return withDelay(body);
  }),
  http.post('*/api/v1/posts/unlike/:postId', async ({ params }) => {
    const post = posts.find(item => item.postId === Number(params.postId));
    if (post && post.likeCount > 0) {
      post.likeCount -= 1;
      post.isLiked = false;
    }
    const body = createMockResponse({ likeCount: post?.likeCount ?? 0, isLiked: false }, 'Mock 게시글 좋아요 취소 성공');
    return withDelay(body);
  }),
  http.post('*/api/v1/posts/:postId/publish', async () => {
    const body = createMockResponse({}, 'Mock 게시글 공개 성공');
    return withDelay(body);
  }),
  http.post('*/api/v1/posts/:postId/unpublish', async () => {
    const body = createMockResponse({}, 'Mock 게시글 비공개 성공');
    return withDelay(body);
  }),
];
