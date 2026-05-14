import { fetchWithAuth } from './auth';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'https://api.veri.me.kr';

export interface AuthorInfo {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface BookInfo {
  bookId?: number;
  title: string;
  author: string;
  imageUrl: string;
  publisher: string;
  isbn: string;
}

export interface Post {
  postId: number;
  title: string;
  content: string;
  thumbnail: string | null;
  author: AuthorInfo;
  book?: BookInfo;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isPublic: boolean;
  isLiked?: boolean;
}

export interface Comment {
  commentId: number | null;
  content: string;
  author: AuthorInfo | null;
  createdAt: string;
  isDeleted: boolean;
  replies?: Comment[];
  parentCommentId?: number | null;
  isMine?: boolean;
}

export interface PostDetail {
  postId: number;
  title: string;
  content: string;
  images: string[];
  author: AuthorInfo;
  book?: BookInfo;
  likeCount: number;
  isLiked: boolean;
  likedMembers?: AuthorInfo[];
  comments: Comment[];
  commentCount: number;
  createdAt: string;
  isMine?: boolean;
}

export interface LikeResponse {
  likeCount: number;
  isLiked: boolean;
}

export interface PostFeedResponse {
  posts: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MyPostsResponse {
  posts: Post[];
  count: number;
}

export interface CardMember {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface Card {
  cardId: number;
  member: CardMember;
  bookTitle: string;
  content: string;
  image: string;
  created: string;
  isPublic: boolean;
}

export interface CardListResponse {
  cards: Card[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface BaseApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export type GetPostFeedResponse = BaseApiResponse<PostFeedResponse>;
export type GetMyPostsResponse = BaseApiResponse<MyPostsResponse>;
export type GetPostDetailResponse = BaseApiResponse<PostDetail>;
export type GetCardsResponse = BaseApiResponse<CardListResponse>;
export type CreatePostResponse = BaseApiResponse<{ postId: number }>;
export type DeletePostResponse = BaseApiResponse<Record<string, never>>;
export type LikePostResponse = BaseApiResponse<LikeResponse>;
export type PublishPostResponse = BaseApiResponse<Record<string, never>>;
export type UnpublishPostResponse = BaseApiResponse<Record<string, never>>;

export interface GetPostFeedQueryParams {
  page?: number;
  size?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}


export interface GetCardsQueryParams {
  page?: number;
  size?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

export interface CreatePostRequest {
  title: string;
  content: string;
  images: string[];
  bookId?: number;
}

const makeApiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, options);
  
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {
      isSuccess: true,
      code: 'SUCCESS',
      message: '요청이 성공적으로 처리되었습니다.',
      result: {}
    } as T;
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (!text.trim()) {
      return {
        isSuccess: true,
        code: 'SUCCESS',
        message: '요청이 성공적으로 처리되었습니다.',
        result: {}
      } as T;
    }
    throw new Error(`Expected JSON response, but got: ${contentType}`);
  }
  
  return response.json();
};

export const getPostFeed = async (
  params: GetPostFeedQueryParams = {}
): Promise<GetPostFeedResponse> => {
  const url = new URL('/api/v1/posts', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort !== undefined) url.searchParams.append('sort', params.sort);

  return makeApiRequest<GetPostFeedResponse>(url.pathname + url.search);
};

export const getCards = async (
  params: GetCardsQueryParams = {}
): Promise<GetCardsResponse> => {
  const url = new URL('/api/v1/cards', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort !== undefined) url.searchParams.append('sort', params.sort);

  return makeApiRequest<GetCardsResponse>(url.pathname + url.search);
};

export const getPostDetail = async (
  postId: number
): Promise<GetPostDetailResponse> => {
  return makeApiRequest<GetPostDetailResponse>(`/api/v1/posts/${postId}`);
};

export const getMyPosts = async (): Promise<GetMyPostsResponse> => {
  return makeApiRequest<GetMyPostsResponse>('/api/v1/posts/my');
};

export const createPost = async (
  postData: CreatePostRequest
): Promise<CreatePostResponse> => {
  return makeApiRequest<CreatePostResponse>('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

export interface UpdatePostRequest {
  title: string;
  content: string;
  images: string[];
  /** 서버가 게시글에 연결할 책(도서) ID — 생략 시 기존 연결 유지 등 서버 정책에 따름 */
  bookId?: number;
}

export interface UpdatePostResponse extends BaseApiResponse<{}> {}

export const updatePost = async (
  postId: number,
  postData: UpdatePostRequest
): Promise<UpdatePostResponse> => {
  return makeApiRequest<UpdatePostResponse>(`/api/v1/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(postData),
  });
};

export const deletePost = async (
  postId: number
): Promise<DeletePostResponse> => {
  return makeApiRequest<DeletePostResponse>(`/api/v1/posts/${postId}`, {
    method: 'DELETE',
  });
};

export const likePost = async (
  postId: number
): Promise<LikePostResponse> => {
  return makeApiRequest<LikePostResponse>(`/api/v1/posts/like/${postId}`, {
    method: 'POST',
  });
};

export const unlikePost = async (
  postId: number
): Promise<LikePostResponse> => {
  return makeApiRequest<LikePostResponse>(`/api/v1/posts/unlike/${postId}`, {
    method: 'POST',
  });
};

export const publishPost = async (
  postId: number
): Promise<PublishPostResponse> => {
  return makeApiRequest<PublishPostResponse>(`/api/v1/posts/${postId}/publish`, {
    method: 'POST',
  });
};

export const unpublishPost = async (
  postId: number
): Promise<UnpublishPostResponse> => {
  return makeApiRequest<UnpublishPostResponse>(`/api/v1/posts/${postId}/unpublish`, {
    method: 'POST',
  });
};
