import { fetchWithAuth } from './auth/authApi';

export const API_BASE_URL =
  import.meta.env.VITE_APP_API_BASE_URL || 'https://api.veri.me.kr';

export interface BaseApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

/** 백엔드 enum (Swagger) */
export type ApiPostSort = 'NEWEST' | 'OLDEST' | 'POPULAR';

/** 프론트 쿼리용 */
export type PostSortQuery = 'newest' | 'oldest' | 'popular';

export function toApiPostSort(sort?: PostSortQuery): ApiPostSort | undefined {
  if (!sort) return undefined;
  const map: Record<PostSortQuery, ApiPostSort> = {
    newest: 'NEWEST',
    oldest: 'OLDEST',
    popular: 'POPULAR',
  };
  return map[sort];
}

export async function makeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {
      isSuccess: true,
      code: 'SUCCESS',
      message: '요청이 성공적으로 처리되었습니다.',
      result: {},
    } as T;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    if (!text.trim()) {
      return {
        isSuccess: true,
        code: 'SUCCESS',
        message: '요청이 성공적으로 처리되었습니다.',
        result: {},
      } as T;
    }
    throw new Error(`Expected JSON response, but got: ${contentType}`);
  }

  return response.json();
}

export function appendPaginationParams(
  url: URL,
  params: { page?: number; size?: number; sort?: PostSortQuery }
): void {
  if (params.page !== undefined) url.searchParams.set('page', String(params.page));
  if (params.size !== undefined) url.searchParams.set('size', String(params.size));
  const apiSort = toApiPostSort(params.sort);
  if (apiSort) url.searchParams.set('sort', apiSort);
}
