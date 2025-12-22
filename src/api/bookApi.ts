// src/api/bookApi.ts
import { getAccessToken } from './auth';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// 타입 정의
export type BookStatus = "NOT_START" | "READING" | "DONE";

export interface CardSummary {
  cardId: number;
  cardImage: string;
}

export interface Book {
  bookId: number;
  memberBookId: number;
  title: string;
  author: string;
  imageUrl: string;
  score: number;
  startedAt: string | null;
  endedAt: string | null;
  status: BookStatus;
  cardSummaries?: CardSummary[];
}

export interface BooksResult {
  memberBooks: Book[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface BookSearchResult {
  title: string;
  author: string;
  imageUrl: string;
  publisher: string;
  isbn: string;
}

export interface TodaysRecommendationBook {
  bookId: number;
  title: string;
  author: string;
  imageUrl: string;
}

export interface PopularBookItem {
  image: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
}

export interface PopularBooksResult {
  books: PopularBookItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// 공통 응답 타입
interface BaseApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 구체적인 응답 타입들
export type GetAllBooksResponse = BaseApiResponse<BooksResult>;
export type GetBookByIdResponse = BaseApiResponse<{
  memberBookId: number;
  member?: {
    id: number;
    nickname: string;
    profileImageUrl: string;
  };
  title: string;
  author: string;
  imageUrl: string;
  status: BookStatus;
  score: number | null;
  startedAt: string | null;
  endedAt: string | null;
  cardSummaries: CardSummary[];
  isPublic?: boolean;
} | null>;
export type SearchBooksResponse = BaseApiResponse<BookSearchResult[]>;
export type GetTodaysRecommendationResponse = BaseApiResponse<TodaysRecommendationBook[]>;
export type GetPopularBooksResponse = BaseApiResponse<PopularBooksResult>;
export type CreateBookResponse = BaseApiResponse<{
  memberBookId: number;
  createdAt: string;
} | null>;
export type DeleteBookResponse = BaseApiResponse<Record<string, never>>;
export type UpdateBookStatusResponse = BaseApiResponse<Record<string, never>>;
export type UpdateBookVisibilityResponse = BaseApiResponse<{
  id: number;
  idPublic: boolean;
}>;
export type GetMyBooksCountResponse = BaseApiResponse<number>;
export type SearchMyBookResponse = BaseApiResponse<number>;

// 쿼리 파라미터 타입들
export interface GetAllBooksQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface GetPopularBooksQueryParams {
  page?: number;
  size?: number;
}

export interface SearchMyBookQueryParams {
  title: string;
  author: string;
}

export interface CreateBookRequest {
  title: string;
  image: string;
  author: string;
  publisher: string;
  isbn: string;
}

export interface UpdateBookStatusRequest {
  score: number;
  startedAt: string | null;
  endedAt: string | null;
}

// UpdateBookContentRequest는 별도 용도로 유지 (책 메타데이터 수정용)
export interface UpdateBookContentRequest {
  title?: string;
  image?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
}

export interface RateBookRequest {
  score: number;
}

// 유틸리티 함수들
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    console.warn(`[fetchWithAuth] Access token is missing for URL: ${url}`);
  }

  const response = await fetch(url, {
    ...options,
    headers: headers as HeadersInit,
  });

  if (!response.ok) {
    let errorMessage = `API call failed: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage += ` - ${errorData.message || response.statusText}`;
    } catch {
      const text = await response.text();
      errorMessage += ` - ${text || response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response;
};

const makeApiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, options);
  
  // 204 No Content 또는 빈 응답 본문 처리
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }
  
  // Content-Type이 JSON이 아닌 경우 처리
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (!text.trim()) {
      return {} as T;
    }
    // JSON이 아닌 텍스트 응답인 경우 에러로 처리하거나 적절히 변환
    throw new Error(`Expected JSON response, but got: ${contentType}`);
  }
  
  return response.json();
};

// API 함수들
export const getAllBooks = async (
  params: GetAllBooksQueryParams
): Promise<GetAllBooksResponse> => {
  const url = new URL('/api/v2/bookshelf/my', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort !== undefined) url.searchParams.append('sort', params.sort);

  return makeApiRequest<GetAllBooksResponse>(url.pathname + url.search);
};

export const getBookById = async (memberBookId: number): Promise<GetBookByIdResponse> => {
  return makeApiRequest<GetBookByIdResponse>(`/api/v2/bookshelf/${memberBookId}`);
};

export const searchBooksByTitle = async (query: string): Promise<SearchBooksResponse> => {
  const url = new URL('/api/v2/bookshelf/search', BASE_URL);
  url.searchParams.append('title', query);
  return makeApiRequest<SearchBooksResponse>(url.pathname + url.search);
};

export const getPopularBooks = async (
  params: GetPopularBooksQueryParams
): Promise<GetPopularBooksResponse> => {
  const url = new URL('/api/v2/bookshelf/popular', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  return makeApiRequest<GetPopularBooksResponse>(url.pathname + url.search);
};

export const getTodaysRecommendation = async (): Promise<GetTodaysRecommendationResponse> => {
  return makeApiRequest<GetTodaysRecommendationResponse>('/api/v2/bookshelf/recommendation/today');
};

export const createBook = async (bookData: CreateBookRequest): Promise<CreateBookResponse> => {
  return makeApiRequest<CreateBookResponse>('/api/v2/bookshelf', {
    method: 'POST',
    body: JSON.stringify(bookData),
  });
};

export const deleteBook = async (memberBookId: number): Promise<DeleteBookResponse> => {
  return makeApiRequest<DeleteBookResponse>(`/api/v2/bookshelf/${memberBookId}`, {
    method: 'DELETE'
  });
};

export const updateBookStatusToStart = async (memberBookId: number): Promise<UpdateBookStatusResponse> => {
  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/status/start`, {
    method: 'PATCH'
  });
};

export const updateBookStatusToOver = async (memberBookId: number): Promise<UpdateBookStatusResponse> => {
  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/status/over`, {
    method: 'PATCH'
  });
};

export const rateBook = async (memberBookId: number, score: number): Promise<UpdateBookStatusResponse> => {
  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/rate`, {
    method: 'PATCH',
    body: JSON.stringify({ score }),
  });
};

// 책장 도서 내용 전체 수정 (별점, 독서 시작/완료 시간, 독서 상태)
// API 명세: PATCH /api/v2/bookshelf/{readingId}/modify
// readingId는 memberBookId와 동일한 값입니다
export const updateBookStatus = async (
  memberBookId: number, // API 명세의 readingId에 해당
  data: UpdateBookStatusRequest
): Promise<UpdateBookStatusResponse> => {
  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/modify`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// 책 메타데이터 수정 (제목, 이미지, 저자, 출판사, ISBN)
// 별도 엔드포인트가 있다면 해당 엔드포인트로 변경 필요
export const updateBookContent = async (
  memberBookId: number, 
  bookData: UpdateBookContentRequest
): Promise<UpdateBookStatusResponse> => {
  // 주의: 이 함수는 책 메타데이터 수정용이므로 별도 엔드포인트가 필요할 수 있습니다
  // 현재는 같은 엔드포인트를 사용하지만, 실제 API에서는 다를 수 있습니다
  return makeApiRequest<UpdateBookStatusResponse>(`/api/v2/bookshelf/${memberBookId}/modify`, {
    method: 'PATCH',
    body: JSON.stringify(bookData),
  });
};

export const getMyBooksCount = async (): Promise<GetMyBooksCountResponse> => {
  return makeApiRequest<GetMyBooksCountResponse>('/api/v2/bookshelf/my/count');
};

export const searchMyBook = async (
  params: SearchMyBookQueryParams
): Promise<SearchMyBookResponse> => {
  const url = new URL('/api/v2/bookshelf/my/search', BASE_URL);
  url.searchParams.append('title', params.title);
  url.searchParams.append('author', params.author);
  
  return makeApiRequest<SearchMyBookResponse>(url.pathname + url.search);
};

/**
 * 독서 공개 여부 수정
 * 비공개시 해당 독서에 대한 모든 독서카드도 비공개로 설정됩니다.
 * 
 * @param readingId - 독서 기록 ID (memberBookId)
 * @param isPublic - 공개 여부 (true: 공개, false: 비공개)
 * @returns 수정 결과
 */
export const updateBookVisibility = async (
  readingId: number,
  isPublic: boolean
): Promise<UpdateBookVisibilityResponse> => {
  const url = new URL(`/api/v2/bookshelf/${readingId}/visibility`, BASE_URL);
  url.searchParams.append('isPublic', String(isPublic));

  try {
    const response = await fetchWithAuth(url.toString(), {
      method: 'PATCH',
    });

    const data: UpdateBookVisibilityResponse = await response.json();
    if (!data.isSuccess) {
      // 에러 객체에 code와 message를 포함하여 throw
      const error: any = new Error(data.message || '독서 공개 여부 수정에 실패했습니다.');
      error.code = data.code;
      error.message = data.message;
      throw error;
    }
    return data;
  } catch (error) {
    console.error('독서 공개 여부 수정 중 오류:', error);
    throw error;
  }
};
