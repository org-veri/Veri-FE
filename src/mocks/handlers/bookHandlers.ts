import { http, HttpResponse, delay } from 'msw';
import {
  createMockResponse,
  mockBooks,
  mockPopularBooks,
  mockSearchResults,
  mockTodaysRecommendation,
} from '../data';

type BookRecord = {
  memberBookId: number;
  bookId?: number;
  title: string;
  author: string;
  imageUrl: string;
  score: number;
  startedAt: string;
  endedAt: string;
  status: 'DONE' | 'READING' | 'NOT_START';
  cardSummaries: { cardId: number; cardImage: string }[];
};

const books: BookRecord[] = mockBooks.map(book => ({
  ...book,
  cardSummaries: Array.isArray(book.cardSummaries) ? [...book.cardSummaries] : [],
}));

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

const findBook = (memberBookId: number) => books.find(book => book.memberBookId === memberBookId);

export const bookHandlers = [
  http.get('*/api/v2/bookshelf/my', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const size = Number(url.searchParams.get('size') || '10');
    const paginated = paginate(books, page, size);
    const body = createMockResponse({
      memberBooks: paginated.map(book => ({ ...book, bookId: book.memberBookId })),
      page,
      size,
      totalElements: books.length,
      totalPages: Math.ceil(books.length / size),
    }, 'Mock 책장 조회 성공');
    return withDelay(body);
  }),
  http.get('*/api/v2/bookshelf/:memberBookId', async ({ params }) => {
    const id = Number(params.memberBookId);
    const book = findBook(id) || null;
    const body = createMockResponse(book, book ? 'Mock 책 상세 조회 성공' : 'Mock 책 상세 조회 실패');
    return withDelay(body);
  }),
  http.get('*/api/v2/bookshelf/search', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || url.searchParams.get('pageNumber') || '1');
    const size = Number(url.searchParams.get('size') || url.searchParams.get('pageSize') || '10');
    const keyword = (url.searchParams.get('title') || url.searchParams.get('query') || '').toLowerCase();
    const result = mockSearchResults.filter(book => {
      if (!keyword) return true;
      return book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword);
    });
    const paginated = paginate(result, page, size);
    const body = createMockResponse({
      books: paginated,
      page,
      size,
      totalElements: result.length,
      totalPages: Math.ceil(result.length / size) || 1,
    }, 'Mock 책 검색 성공');
    return withDelay(body);
  }),
  http.get('*/api/v2/bookshelf/popular', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const size = Number(url.searchParams.get('size') || '10');
    const paginated = paginate(mockPopularBooks, page, size);
    const body = createMockResponse({
      books: paginated,
      page,
      size,
      totalElements: mockPopularBooks.length,
      totalPages: Math.ceil(mockPopularBooks.length / size) || 1,
    }, 'Mock 인기 도서 조회 성공');
    return withDelay(body);
  }),
  http.get('*/api/v2/bookshelf/recommendation/today', async () => {
    const body = createMockResponse(mockTodaysRecommendation, 'Mock 오늘의 추천 도서 조회 성공');
    return withDelay(body);
  }),
  http.post('*/api/v2/bookshelf', async ({ request }) => {
    const data = await safeJson<Partial<BookRecord>>(request);
    const newId = Math.max(...books.map(book => book.memberBookId)) + 1;
    books.push({
      memberBookId: newId,
      bookId: newId,
      title: data.title ?? '새 책',
      author: data.author ?? '작가 미상',
      imageUrl: data.imageUrl ?? 'https://placehold.co/100x150?text=New',
      status: 'NOT_START',
      score: 0,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      cardSummaries: [],
    });
    const body = createMockResponse({
      memberBookId: newId,
      createdAt: new Date().toISOString(),
    }, 'Mock 책 등록 성공');
    return withDelay(body);
  }),
  http.delete('*/api/v2/bookshelf/:memberBookId', async ({ params }) => {
    const id = Number(params.memberBookId);
    const index = books.findIndex(book => book.memberBookId === id);
    if (index >= 0) {
      books.splice(index, 1);
    }
    const body = createMockResponse({}, 'Mock 책 삭제 성공');
    return withDelay(body);
  }),
  http.post('*/api/v2/bookshelf/:memberBookId/start', async ({ params }) => {
    const body = createMockResponse({ id: Number(params.memberBookId) }, 'Mock 독서 시작 성공');
    return withDelay(body);
  }),
  http.post('*/api/v2/bookshelf/:memberBookId/over', async ({ params }) => {
    const body = createMockResponse({ id: Number(params.memberBookId) }, 'Mock 독서 완료 성공');
    return withDelay(body);
  }),
  http.patch('*/api/v2/bookshelf/:memberBookId/rate', async ({ params, request }) => {
    const id = Number(params.memberBookId);
    const { score = 0 } = await safeJson<{ score?: number }>(request);
    const book = findBook(id);
    if (book) {
      book.score = score;
    }
    const body = createMockResponse({ id, score }, 'Mock 별점 수정 성공');
    return withDelay(body);
  }),
  http.patch('*/api/v2/bookshelf/:memberBookId/modify', async ({ params, request }) => {
    const id = Number(params.memberBookId);
    const updates = await safeJson<Partial<BookRecord>>(request);
    const book = findBook(id);
    if (book) {
      Object.assign(book, updates);
    }
    const body = createMockResponse({ id, ...updates }, 'Mock 독서 상태 수정 성공');
    return withDelay(body);
  }),
  http.get('*/api/v2/bookshelf/my/count', async () => {
    const body = createMockResponse({ count: books.length }, 'Mock 내 책 개수 조회 성공');
    return withDelay(body);
  }),
  http.get('*/api/v2/bookshelf/my/search', async ({ request }) => {
    const url = new URL(request.url);
    const title = (url.searchParams.get('title') || '').toLowerCase();
    const author = (url.searchParams.get('author') || '').toLowerCase();
    const found = books.find(book =>
      book.title.toLowerCase().includes(title) &&
      book.author.toLowerCase().includes(author)
    );
    const body = createMockResponse({ memberBookId: found ? found.memberBookId : 0 }, found ? 'Mock 내 책 검색 성공' : 'Mock 검색 결과 없음');
    return withDelay(body);
  }),
  http.patch('*/api/v2/bookshelf/:readingId/visibility', async ({ params, request }) => {
    const url = new URL(request.url);
    const param = url.searchParams.get('isPublic');
    const bodyPayload = await safeJson<Record<string, unknown>>(request);
    const resolved = typeof bodyPayload.isPublic === 'boolean'
      ? bodyPayload.isPublic
      : (param ? param.toLowerCase() === 'true' : true);
    const body = createMockResponse({
      id: Number(params.readingId),
      idPublic: resolved,
      isPublic: resolved,
    }, 'Mock 독서 공개 여부 수정 성공');
    return withDelay(body);
  }),
];
