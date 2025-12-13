// src/api/communityCommentsApi.ts
import { getAccessToken } from './auth';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'https://api.veri.me.kr';

// 타입 정의

// 댓글 작성 요청
export interface CreateCommentRequest {
  postId: number;
  content: string;
}

// 댓글 수정 요청
export interface UpdateCommentRequest {
  content: string;
}

// 대댓글 작성 요청
export interface CreateReplyRequest {
  parentCommentId: number;
  content: string;
}

// 공통 응답 타입
interface BaseApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 구체적인 응답 타입들
export type CreateCommentResponse = BaseApiResponse<number>;
export type CreateReplyResponse = BaseApiResponse<number>;
export type UpdateCommentResponse = BaseApiResponse<Record<string, never>>;
export type DeleteCommentResponse = BaseApiResponse<Record<string, never>>;

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
  
  // 204 No Content 또는 빈 응답 본문 처리 - 성공 응답으로 처리
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    // 204 No Content는 성공을 의미하므로 isSuccess: true로 반환
    return {
      isSuccess: true,
      code: 'C0000',
      message: '요청에 성공했습니다.',
      result: {}
    } as T;
  }
  
  // Content-Type이 JSON이 아닌 경우 처리
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (!text.trim()) {
      // 빈 텍스트도 성공으로 처리
      return {
        isSuccess: true,
        code: 'C0000',
        message: '요청에 성공했습니다.',
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
 * 댓글 작성
 * 게시글에 댓글을 작성합니다.
 * 
 * @param commentData - 댓글 작성 데이터 (postId, content)
 * @returns 생성된 댓글 ID
 */
export const createComment = async (
  commentData: CreateCommentRequest
): Promise<CreateCommentResponse> => {
  return makeApiRequest<CreateCommentResponse>('/api/v1/comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
};

/**
 * 댓글 삭제
 * 댓글을 삭제합니다.
 * 
 * @param commentId - 삭제할 댓글 ID
 * @returns 삭제 결과
 */
export const deleteComment = async (
  commentId: number
): Promise<DeleteCommentResponse> => {
  return makeApiRequest<DeleteCommentResponse>(`/api/v1/comments/${commentId}`, {
    method: 'DELETE',
  });
};

/**
 * 댓글 수정
 * 댓글의 내용을 수정합니다.
 * 
 * @param commentId - 수정할 댓글 ID
 * @param commentData - 수정할 댓글 데이터 (content)
 * @returns 수정 결과
 */
export const updateComment = async (
  commentId: number,
  commentData: UpdateCommentRequest
): Promise<UpdateCommentResponse> => {
  return makeApiRequest<UpdateCommentResponse>(`/api/v1/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify(commentData),
  });
};

/**
 * 대댓글 작성
 * 댓글에 대한 대댓글을 작성합니다.
 * 
 * @param replyData - 대댓글 작성 데이터 (parentCommentId, content)
 * @returns 생성된 대댓글 ID
 */
export const createReply = async (
  replyData: CreateReplyRequest
): Promise<CreateReplyResponse> => {
  return makeApiRequest<CreateReplyResponse>('/api/v1/comments/reply', {
    method: 'POST',
    body: JSON.stringify(replyData),
  });
};

