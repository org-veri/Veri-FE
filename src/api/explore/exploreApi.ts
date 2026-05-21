/**
 * 탐색 API — Swagger「탐색」
 * 공개 피드, 팔로잉 피드, 공개 카드, 인기 도서/게시글, 공개 독서 검색
 */
import {
  API_BASE_URL,
  appendPaginationParams,
  makeApiRequest,
  type BaseApiResponse,
  type PostSortQuery,
} from '../apiClient';
import { normalizePost, type Post, type PostFeedResponse } from '../types/community';
import { normalizeExploreCard, type CardListResponse, type ExploreCard } from '../types/card';

export type { Post, PostFeedResponse };
export type { ExploreCard as Card, CardListResponse };
export type GetPostFeedResponse = BaseApiResponse<PostFeedResponse>;
export type GetCardsResponse = BaseApiResponse<CardListResponse>;

export interface PaginationQueryParams {
  page?: number;
  size?: number;
  sort?: PostSortQuery;
}

export interface PopularBookItem {
  id: number;
  title: string;
  author: string;
  image: string;
  isbn: string;
  publisher: string;
  rank: number;
  readingCount: number;
  cardCount: number;
}

export interface PopularBooksResult {
  calculatedAt: string;
  books: PopularBookItem[];
}

export interface PopularPostItem {
  id: number;
  title: string;
  authorNickname: string;
  thumbnailUrl: string;
  rank: number;
  likeCount: number;
  commentCount: number;
}

export interface PopularPostsResult {
  calculatedAt: string;
  posts: PopularPostItem[];
}

export interface PublicReadingItem {
  id: number;
  bookId: number;
  title: string;
  author: string;
  imageUrl: string;
  score: number;
  startedAt: string;
  isPublic: boolean;
}

export interface PublicReadingSearchResult {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  books: PublicReadingItem[];
}

export type GetPopularBooksResponse = BaseApiResponse<PopularBooksResult>;
export type GetPopularPostsResponse = BaseApiResponse<PopularPostsResult>;
export type SearchPublicReadingsResponse = BaseApiResponse<PublicReadingSearchResult>;

function normalizePublicReading(raw: Record<string, unknown>): PublicReadingItem {
  return {
    id: raw.id as number,
    bookId: raw.bookId as number,
    title: String(raw.title ?? ''),
    author: String(raw.author ?? ''),
    imageUrl: String(raw.imageUrl ?? ''),
    score: Number(raw.score ?? 0),
    startedAt: String(raw.startedAt ?? ''),
    isPublic: Boolean(raw.isPublic ?? raw.public ?? true),
  };
}

async function fetchPostFeed(path: string, params: PaginationQueryParams): Promise<GetPostFeedResponse> {
  const url = new URL(path, API_BASE_URL);
  appendPaginationParams(url, params);
  const res = await makeApiRequest<GetPostFeedResponse>(url.pathname + url.search);
  if (res.isSuccess && res.result?.posts) {
    res.result.posts = res.result.posts.map((p) =>
      normalizePost(p as unknown as Record<string, unknown>)
    );
  }
  return res;
}

async function fetchCardFeed(path: string, params: PaginationQueryParams): Promise<GetCardsResponse> {
  const url = new URL(path, API_BASE_URL);
  appendPaginationParams(url, params);
  const res = await makeApiRequest<GetCardsResponse>(url.pathname + url.search);
  if (res.isSuccess && res.result?.cards) {
    res.result.cards = res.result.cards.map((c) =>
      normalizeExploreCard(c as unknown as Record<string, unknown>)
    );
  }
  return res;
}

/** GET /api/posts — 공개 피드 */
export const getPostFeed = (params: PaginationQueryParams = {}) =>
  fetchPostFeed('/api/posts', params);

/** GET /api/posts/following — 팔로잉 게시글 */
export const getFollowingPostFeed = (params: PaginationQueryParams = {}) =>
  fetchPostFeed('/api/posts/following', params);

/** GET /api/cards — 전체 공개 카드 (커뮤니티) */
export const getCards = (params: PaginationQueryParams = {}) =>
  fetchCardFeed('/api/cards', params);

/** GET /api/cards/following — 팔로잉 카드 피드 */
export const getFollowingCards = (params: PaginationQueryParams = {}) =>
  fetchCardFeed('/api/cards/following', params);

/** GET /api/popular/books */
export const getPopularBooks = async (page = 1, limit = 10): Promise<GetPopularBooksResponse> => {
  const url = new URL('/api/popular/books', API_BASE_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  return makeApiRequest<GetPopularBooksResponse>(url.pathname + url.search);
};

/** GET /api/popular/posts */
export const getPopularPosts = async (page = 1, limit = 10): Promise<GetPopularPostsResponse> => {
  const url = new URL('/api/popular/posts', API_BASE_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  return makeApiRequest<GetPopularPostsResponse>(url.pathname + url.search);
};

/** GET /api/bookshelf/public/search — 전체 공개 독서 기록 검색 */
export const searchPublicReadings = async (
  query: string,
  params: PaginationQueryParams = {}
): Promise<SearchPublicReadingsResponse> => {
  const url = new URL('/api/bookshelf/public/search', API_BASE_URL);
  url.searchParams.set('query', query);
  appendPaginationParams(url, params);
  const res = await makeApiRequest<SearchPublicReadingsResponse>(url.pathname + url.search);
  if (res.isSuccess && res.result?.books) {
    res.result.books = res.result.books.map((b) =>
      normalizePublicReading(b as unknown as Record<string, unknown>)
    );
  }
  return res;
};
