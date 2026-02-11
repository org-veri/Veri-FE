import { getAccessToken } from './auth';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'https://api.veri.me.kr';

export interface CreateCommentRequest {
  postId: number;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CreateReplyRequest {
  parentCommentId: number;
  content: string;
}

interface BaseApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export type CreateCommentResponse = BaseApiResponse<number>;
export type CreateReplyResponse = BaseApiResponse<number>;
export type UpdateCommentResponse = BaseApiResponse<Record<string, never>>;
export type DeleteCommentResponse = BaseApiResponse<Record<string, never>>;

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
    const responseClone = response.clone();
    let errorMessage = '';
    
    try {
      const errorData = await responseClone.json();
      if (errorData.message && errorData.message.trim()) {
        errorMessage = errorData.message;
      } else if (errorData.code) {
        errorMessage = `오류 코드: ${errorData.code}`;
      }
    } catch {
      try {
        const text = await responseClone.text();
        if (text && text.trim()) {
          errorMessage = text.trim();
        }
      } catch {
      }
    }
    
    if (!errorMessage) {
      const statusMessages: Record<number, string> = {
        400: '잘못된 요청입니다.',
        401: '인증이 필요합니다.',
        403: '접근 권한이 없습니다.',
        404: '요청한 리소스를 찾을 수 없습니다.',
        500: '서버 오류가 발생했습니다.',
        502: '서버에 연결할 수 없습니다.',
        503: '서비스를 사용할 수 없습니다.',
      };
      errorMessage = statusMessages[response.status] || `서버 오류가 발생했습니다 (${response.status})`;
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
  
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {
      isSuccess: true,
      code: 'C0000',
      message: '요청에 성공했습니다.',
      result: {}
    } as T;
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (!text.trim()) {
      return {
        isSuccess: true,
        code: 'C0000',
        message: '요청에 성공했습니다.',
        result: {}
      } as T;
    }
    throw new Error(`Expected JSON response, but got: ${contentType}`);
  }
  
  return response.json();
};

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

