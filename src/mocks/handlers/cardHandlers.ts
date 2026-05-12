import { http, HttpResponse, delay } from 'msw';
import { createMockResponse, mockCards } from '../data';

type MockCard = typeof mockCards[number];
const cards: MockCard[] = mockCards.map(card => ({ ...card }));

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

const nextCardId = () => (
  cards.length ? Math.max(...cards.map(card => card.cardId)) + 1 : 1
);

export const cardHandlers = [
  http.get('*/api/v1/cards/my', async ({ request }) => {
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
    }, 'Mock 내 독서카드 조회 성공');
    return withDelay(body);
  }),
  http.get('*/api/v1/cards/:cardId', async ({ params }) => {
    const id = Number(params.cardId);
    const card = cards.find(c => c.cardId === id);
    const body = createMockResponse(card ? {
      id,
      content: card.content,
      imageUrl: card.image,
      createdAt: card.created,
      isPublic: card.isPublic,
      book: {
        id: 1,
        title: '해리포터와 마법사의 돌',
        coverImageUrl: 'https://placehold.co/100x150?text=BookCover',
        author: 'J.K. 롤링',
      },
    } : null, card ? 'Mock 독서카드 상세 조회 성공' : 'Mock 독서카드 없음');
    return withDelay(body);
  }),
  http.post('*/api/v1/cards', async ({ request }) => {
    const bodyData = await safeJson<Partial<{ content: string; imageUrl: string }>>(request);
    const id = nextCardId();
    cards.push({
      cardId: id,
      content: bodyData.content ?? '새 독서카드',
      image: bodyData.imageUrl ?? 'https://placehold.co/150x200?text=Card',
      created: new Date().toISOString(),
      isPublic: true,
    });
    const body = createMockResponse({ cardId: id }, 'Mock 독서카드 생성 성공');
    return withDelay(body);
  }),
  http.post('*/api/v1/cards/image', async () => {
    const body = createMockResponse({
      presignedUrl: 'https://mock-presigned-url.example.com/upload/mock-image.jpg?AWSAccessKeyId=MOCKKEY&Expires=MOCKEXP&Signature=MOCKSIG',
      publicUrl: 'https://mock-public-url.example.com/mock-image.jpg',
    }, 'Mock presigned URL 성공');
    return withDelay(body);
  }),
  http.delete('*/api/v1/cards/:cardId', async ({ params }) => {
    const id = Number(params.cardId);
    const index = cards.findIndex(card => card.cardId === id);
    if (index >= 0) {
      cards.splice(index, 1);
    }
    const body = createMockResponse({}, 'Mock 독서카드 삭제 성공');
    return withDelay(body);
  }),
  http.get('*/api/v1/cards/my/count', async () => {
    const body = createMockResponse({ count: cards.length }, 'Mock 내 독서카드 개수 조회 성공');
    return withDelay(body);
  }),
  http.patch('*/api/v1/cards/:cardId', async ({ params, request }) => {
    const id = Number(params.cardId);
    const updates = await safeJson<Partial<{ content: string; imageUrl: string }>>(request);
    const card = cards.find(c => c.cardId === id);
    if (card) {
      card.content = updates.content ?? card.content;
      card.image = updates.imageUrl ?? card.image;
    }
    const body = createMockResponse({
      id,
      content: card?.content ?? updates.content,
      imageUrl: card?.image ?? updates.imageUrl,
      createdAt: card?.created ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      book: {
        id: 1,
        title: '해리포터와 마법사의 돌',
        coverImageUrl: 'https://placehold.co/100x150?text=BookCover',
        author: 'J.K. 롤링',
      },
    }, 'Mock 독서카드 수정 성공');
    return withDelay(body);
  }),
  http.patch('*/api/v1/cards/:cardId/visibility', async ({ params, request }) => {
    const url = new URL(request.url);
    const param = url.searchParams.get('isPublic');
    const bodyPayload = await safeJson<Record<string, unknown>>(request);
    const isPublic = typeof bodyPayload.isPublic === 'boolean'
      ? bodyPayload.isPublic
      : (param ? param.toLowerCase() === 'true' : true);
    const card = cards.find(c => c.cardId === Number(params.cardId));
    if (card) {
      card.isPublic = isPublic;
    }
    const body = createMockResponse({
      id: Number(params.cardId),
      idPublic: isPublic,
      isPublic,
    }, 'Mock 독서카드 공개 여부 수정 성공');
    return withDelay(body);
  }),
];
