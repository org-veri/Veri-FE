import { fetchWithAuth } from './cardApi';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

export interface Bookmark {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string;
  pageNumber?: number;
  note?: string;
  createdAt: string;
  isBookmarked: boolean;
}

export interface GetBookmarksResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Bookmark[];
}

export const getBookmarks = async (): Promise<GetBookmarksResponse> => {
  const response = await fetchWithAuth(`${BASE_URL}/api/v1/bookmarks`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('북마크 목록을 불러오지 못했습니다.');
  }

  return response.json();
};
