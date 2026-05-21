/**
 * 댓글 API — Swagger「공유」/comments
 */
import { makeApiRequest, type BaseApiResponse } from '../apiClient';
import { normalizeComment, type AuthorInfo, type Comment } from '../types/community';

export type { AuthorInfo, Comment };

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

export interface CommentsListResult {
  comments: Comment[];
  count: number;
}

export type CreateCommentResponse = BaseApiResponse<{ commentId: number }>;
export type CreateReplyResponse = BaseApiResponse<{ commentId: number }>;
export type UpdateCommentResponse = BaseApiResponse<Record<string, never>>;
export type DeleteCommentResponse = BaseApiResponse<Record<string, never>>;
export type GetCommentsResponse = BaseApiResponse<CommentsListResult>;

export const getComments = async (postId: number): Promise<GetCommentsResponse> => {
  const res = await makeApiRequest<GetCommentsResponse>(`/api/comments?postId=${postId}`);
  if (res.isSuccess && res.result?.comments) {
    res.result.comments = res.result.comments.map((c) =>
      normalizeComment(c as unknown as Record<string, unknown>)
    );
  }
  return res;
};

export const createComment = async (
  commentData: CreateCommentRequest
): Promise<CreateCommentResponse> => {
  return makeApiRequest<CreateCommentResponse>('/api/comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
};

export const deleteComment = async (commentId: number): Promise<DeleteCommentResponse> => {
  return makeApiRequest<DeleteCommentResponse>(`/api/comments/${commentId}`, {
    method: 'DELETE',
  });
};

export const updateComment = async (
  commentId: number,
  commentData: UpdateCommentRequest
): Promise<UpdateCommentResponse> => {
  return makeApiRequest<UpdateCommentResponse>(`/api/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify(commentData),
  });
};

export const createReply = async (
  replyData: CreateReplyRequest
): Promise<CreateReplyResponse> => {
  return makeApiRequest<CreateReplyResponse>('/api/comments/reply', {
    method: 'POST',
    body: JSON.stringify(replyData),
  });
};
