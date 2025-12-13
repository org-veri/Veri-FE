// src/api/communityApi.ts
import { getAccessToken } from './auth';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'https://api.veri.me.kr';

// 타입 정의
export interface AuthorInfo {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface BookInfo {
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
  book?: BookInfo; // 선택적 속성으로 변경
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isPublic: boolean;
  isLiked?: boolean; // 좋아요 여부
}

// 댓글 타입
export interface Comment {
  commentId: number | null;
  content: string;
  author: AuthorInfo | null;
  createdAt: string;
  isDeleted: boolean;
  replies?: Comment[]; // 대댓글 목록 (선택적)
  parentCommentId?: number | null; // 부모 댓글 ID (선택적)
  isMine?: boolean; // 본인 댓글 여부
}

// 게시글 상세 정보 타입
export interface PostDetail {
  postId: number;
  title: string;
  content: string;
  images: string[];
  author: AuthorInfo;
  book?: BookInfo;
  likeCount: number;
  isLiked: boolean;
  likedMembers?: AuthorInfo[]; // 좋아요를 누른 사용자 목록
  comments: Comment[];
  commentCount: number;
  createdAt: string;
  isMine?: boolean; // 본인 게시글 여부
}

// 좋아요 응답 타입
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

// 카드 관련 타입들
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

// 공통 응답 타입
interface BaseApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 구체적인 응답 타입들
export type GetPostFeedResponse = BaseApiResponse<PostFeedResponse>;
export type GetMyPostsResponse = BaseApiResponse<MyPostsResponse>;
export type GetPostDetailResponse = BaseApiResponse<PostDetail>;
export type GetCardsResponse = BaseApiResponse<CardListResponse>;
export type CreatePostResponse = BaseApiResponse<number>;
export type DeletePostResponse = BaseApiResponse<Record<string, never>>;
export type LikePostResponse = BaseApiResponse<LikeResponse>;
export type PublishPostResponse = BaseApiResponse<Record<string, never>>;
export type UnpublishPostResponse = BaseApiResponse<Record<string, never>>;

// 쿼리 파라미터 타입들
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

// 게시글 작성 요청 타입
export interface CreatePostRequest {
  title: string;
  content: string;
  images: string[];
  bookId?: number;
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
    // 204는 성공적인 응답이므로 BaseApiResponse 형식으로 반환
    return {
      isSuccess: true,
      code: 'SUCCESS',
      message: '요청이 성공적으로 처리되었습니다.',
      result: {}
    } as T;
  }
  
  // Content-Type이 JSON이 아닌 경우 처리
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (!text.trim()) {
      // 빈 응답도 성공으로 간주
      return {
        isSuccess: true,
        code: 'SUCCESS',
        message: '요청이 성공적으로 처리되었습니다.',
        result: {}
      } as T;
    }
    // JSON이 아닌 텍스트 응답인 경우 에러로 처리하거나 적절히 변환
    throw new Error(`Expected JSON response, but got: ${contentType}`);
  }
  
  return response.json();
};

// API 함수들

/**
 * 전체 게시글 목록 조회
 * 모든 사용자의 게시글 목록을 페이지네이션과 정렬 기준으로 조회합니다.
 * 
 * @param params - 쿼리 파라미터 (page, size, sort)
 * @returns 게시글 목록과 페이지네이션 정보
 */
export const getPostFeed = async (
  params: GetPostFeedQueryParams = {}
): Promise<GetPostFeedResponse> => {
  const url = new URL('/api/v1/posts', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort !== undefined) url.searchParams.append('sort', params.sort);

  return makeApiRequest<GetPostFeedResponse>(url.pathname + url.search);
};

/**
 * 전체 카드 목록 조회
 * 모든 사용자의 공개된 카드 목록을 페이지네이션과 정렬 기준으로 조회합니다.
 * 
 * @param params - 쿼리 파라미터 (page, size, sort)
 * @returns 카드 목록과 페이지네이션 정보
 */
export const getCards = async (
  params: GetCardsQueryParams = {}
): Promise<GetCardsResponse> => {
  const url = new URL('/api/v1/cards', BASE_URL);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort !== undefined) url.searchParams.append('sort', params.sort);

  return makeApiRequest<GetCardsResponse>(url.pathname + url.search);
};

/**
 * 게시글 상세 조회
 * 게시글 ID로 게시글의 상세 정보를 조회합니다.
 * 
 * @param postId - 조회할 게시글 ID
 * @returns 게시글 상세 정보
 */
export const getPostDetail = async (
  postId: number
): Promise<GetPostDetailResponse> => {
  return makeApiRequest<GetPostDetailResponse>(`/api/v1/posts/${postId}`);
};

/**
 * 내 게시글 목록 조회
 * 로그인한 사용자의 게시글 목록을 조회합니다.
 * 
 * @returns 내 게시글 목록과 개수
 */
export const getMyPosts = async (): Promise<GetMyPostsResponse> => {
  return makeApiRequest<GetMyPostsResponse>('/api/v1/posts/my');
};

/**
 * 새 게시글 작성
 * 새로운 게시글을 작성합니다.
 * 
 * @param postData - 게시글 작성 데이터 (title, content, images, bookId)
 * @returns 생성된 게시글 ID
 */
export const createPost = async (
  postData: CreatePostRequest
): Promise<CreatePostResponse> => {
  return makeApiRequest<CreatePostResponse>('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

/**
 * 게시글 수정
 * 게시글을 수정합니다.
 * 
 * @param postId - 수정할 게시글 ID
 * @param postData - 게시글 수정 데이터 (title, content, images)
 * @returns 수정 결과
 */
export interface UpdatePostRequest {
  title: string;
  content: string;
  images: string[];
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

/**
 * 게시글 삭제
 * 게시글을 삭제합니다.
 * 
 * @param postId - 삭제할 게시글 ID
 * @returns 삭제 결과
 */
export const deletePost = async (
  postId: number
): Promise<DeletePostResponse> => {
  return makeApiRequest<DeletePostResponse>(`/api/v1/posts/${postId}`, {
    method: 'DELETE',
  });
};

/**
 * 게시글 좋아요
 * 게시글에 좋아요를 추가합니다.
 * 
 * @param postId - 좋아요를 추가할 게시글 ID
 * @returns 좋아요 수와 좋아요 상태
 */
export const likePost = async (
  postId: number
): Promise<LikePostResponse> => {
  return makeApiRequest<LikePostResponse>(`/api/v1/posts/like/${postId}`, {
    method: 'POST',
  });
};

/**
 * 게시글 좋아요 취소
 * 게시글의 좋아요를 취소합니다.
 * 
 * @param postId - 좋아요를 취소할 게시글 ID
 * @returns 좋아요 수와 좋아요 상태
 */
export const unlikePost = async (
  postId: number
): Promise<LikePostResponse> => {
  return makeApiRequest<LikePostResponse>(`/api/v1/posts/unlike/${postId}`, {
    method: 'POST',
  });
};

/**
 * 게시글 공개
 * 게시글을 공개합니다.
 * 
 * @param postId - 공개할 게시글 ID
 * @returns 공개 결과
 */
export const publishPost = async (
  postId: number
): Promise<PublishPostResponse> => {
  return makeApiRequest<PublishPostResponse>(`/api/v1/posts/${postId}/publish`, {
    method: 'POST',
  });
};

/**
 * 게시글 비공개
 * 게시글을 비공개합니다.
 * 
 * @param postId - 비공개할 게시글 ID
 * @returns 비공개 결과
 */
export const unpublishPost = async (
  postId: number
): Promise<UnpublishPostResponse> => {
  return makeApiRequest<UnpublishPostResponse>(`/api/v1/posts/${postId}/unpublish`, {
    method: 'POST',
  });
};
