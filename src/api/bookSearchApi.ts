import { getAccessToken } from './auth';

export type BookItem = {
    title: string;
    author: string;
    imageUrl: string;
    publisher: string;
    isbn: string;
}

export type BookSearchResponseResult = {
    books: BookItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export type ApiResponse<T> = {
    isSuccess: boolean;
    code: string;
    message: string;
    result?: T;
}

export const searchBooks = async (query: string, page: number = 1, size: number = 10): Promise<ApiResponse<BookSearchResponseResult>> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            return { isSuccess: false, code: 'AUTH_ERROR', message: '인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.' };
        }

        const baseUrl = import.meta.env.VITE_APP_API_BASE_URL;
        if (!baseUrl) {
            return { isSuccess: false, code: 'ENV_ERROR', message: 'API 기본 URL이 설정되지 않았습니다.' };
        }

        const url = new URL('/api/bookshelf/search', baseUrl);
        url.searchParams.append('query', query);
        url.searchParams.append('page', String(page));
        url.searchParams.append('size', String(size));
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const responseClone = response.clone();
            let errorMessage = '책 검색 실패';
            try {
                const errorData = await responseClone.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
            }
            return { isSuccess: false, code: response.status.toString(), message: errorMessage };
        }

        const data: ApiResponse<BookSearchResponseResult> = await response.json();
        return data;
    } catch (error: any) {
        if (error.message === 'TOKEN_EXPIRED') {
            throw error;
        }
        return { isSuccess: false, code: 'NETWORK_ERROR', message: `네트워크 오류: ${error.message}` };
    }
};
