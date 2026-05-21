import { makeApiRequest, type BaseApiResponse } from '../apiClient';

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

export type GetBookmarksResponse = BaseApiResponse<Bookmark[]>;

export const getBookmarks = async (): Promise<GetBookmarksResponse> => {
  return makeApiRequest<GetBookmarksResponse>('/api/bookmarks');
};
