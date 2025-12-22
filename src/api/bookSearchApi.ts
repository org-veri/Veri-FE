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

/**
 * 책을 검색하는 API 호출 함수
 * @param query 검색어 (책 제목, 저자, ISBN 등)
 * @param page 검색할 페이지 번호 (Default: 1)
 * @param size 페이지 당 아이템 수 (Default: 10)
 * @returns 검색 결과 책 목록과 페이징 정보 또는 오류 메시지
 */
export const searchBooks = async (query: string, page: number = 1, size: number = 10): Promise<ApiResponse<BookSearchResponseResult>> => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            return { isSuccess: false, code: 'AUTH_ERROR', message: '인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.' };
        }

        const baseUrl = import.meta.env.VITE_APP_API_BASE_URL;
        if (!baseUrl) {
            console.error('Environment variable VITE_APP_API_BASE_URL is not defined.');
            return { isSuccess: false, code: 'ENV_ERROR', message: 'API 기본 URL이 설정되지 않았습니다.' };
        }

        const url = new URL('/api/v2/bookshelf/search', baseUrl);
        url.searchParams.append('query', query);
        url.searchParams.append('page', String(page));
        url.searchParams.append('size', String(size));
        
        console.log("API 호출 URL:", url.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            let errorMessage = '책 검색 실패';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // JSON 파싱 실패 시 기본 메시지 사용
            }
            return { isSuccess: false, code: response.status.toString(), message: errorMessage };
        }

        const data: ApiResponse<BookSearchResponseResult> = await response.json();
        return data;
    } catch (error: any) {
        console.error('책 검색 API 호출 중 오류 발생:', error);
        if (error.message === 'TOKEN_EXPIRED') {
            throw error;
        }
        return { isSuccess: false, code: 'NETWORK_ERROR', message: `네트워크 오류: ${error.message}` };
    }
};
