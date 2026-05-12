import { fetchWithAuth } from './auth';

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

export type CreateCommentResponse = BaseApiResponse<{ commentId: number }>;
export type CreateReplyResponse = BaseApiResponse<{ commentId: number }>;
export type UpdateCommentResponse = BaseApiResponse<Record<string, never>>;
export type DeleteCommentResponse = BaseApiResponse<Record<string, never>>;

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

export const createComment = async (
  commentData: CreateCommentRequest
): Promise<CreateCommentResponse> => {
  return makeApiRequest<CreateCommentResponse>('/api/v1/comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
};

export const deleteComment = async (
  commentId: number
): Promise<DeleteCommentResponse> => {
  return makeApiRequest<DeleteCommentResponse>(`/api/v1/comments/${commentId}`, {
    method: 'DELETE',
  });
};

export const updateComment = async (
  commentId: number,
  commentData: UpdateCommentRequest
): Promise<UpdateCommentResponse> => {
  return makeApiRequest<UpdateCommentResponse>(`/api/v1/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify(commentData),
  });
};

export const createReply = async (
  replyData: CreateReplyRequest
): Promise<CreateReplyResponse> => {
  return makeApiRequest<CreateReplyResponse>('/api/v1/comments/reply', {
    method: 'POST',
    body: JSON.stringify(replyData),
  });
};

