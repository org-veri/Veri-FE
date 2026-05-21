/**
 * 게시글 API — Swagger「공유」/posts
 * GET/POST /api/posts, GET/PATCH/DELETE /api/posts/{postId},
 * publish/unpublish, like/unlike, image presigned
 */
import { makeApiRequest, type BaseApiResponse } from '../apiClient';
import {
  normalizeLikeResult,
  normalizePost,
  normalizePostDetail,
  type LikeResponse,
  type MyPostsResponse,
  type PostDetail,
  type PostImagePresignedResult,
} from '../types/community';
import type { PostSortQuery } from '../apiClient';
import { appendPaginationParams, API_BASE_URL } from '../apiClient';

export type {
  AuthorInfo,
  BookInfo,
  Comment,
  LikedMemberInfo,
  LikeResponse,
  Post,
  PostDetail,
  PostFeedResponse,
  MyPostsResponse,
  PostImagePresignedResult,
} from '../types/community';

export type GetPostDetailResponse = BaseApiResponse<PostDetail>;
export type GetMyPostsResponse = BaseApiResponse<MyPostsResponse>;
export type CreatePostResponse = BaseApiResponse<{ postId: number }>;
export type DeletePostResponse = BaseApiResponse<Record<string, never>>;
export type LikePostResponse = BaseApiResponse<LikeResponse>;
export type PublishPostResponse = BaseApiResponse<Record<string, never>>;
export type UnpublishPostResponse = BaseApiResponse<Record<string, never>>;
export type CreatePostImageResponse = BaseApiResponse<PostImagePresignedResult>;
export type UpdatePostResponse = BaseApiResponse<Record<string, never>>;

export interface GetMyPostsQueryParams {
  page?: number;
  size?: number;
  sort?: PostSortQuery;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  images: string[];
  bookId?: number;
  public?: boolean;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  images: string[];
  public?: boolean;
}

export const getPostDetail = async (postId: number): Promise<GetPostDetailResponse> => {
  const res = await makeApiRequest<GetPostDetailResponse>(`/api/posts/${postId}`);
  if (res.isSuccess && res.result) {
    res.result = normalizePostDetail(res.result as unknown as Record<string, unknown>);
  }
  return res;
};

export const getMyPosts = async (
  params: GetMyPostsQueryParams = {}
): Promise<GetMyPostsResponse> => {
  const url = new URL('/api/posts/my', API_BASE_URL);
  appendPaginationParams(url, params);
  const res = await makeApiRequest<GetMyPostsResponse>(url.pathname + url.search);
  if (res.isSuccess && res.result?.posts) {
    res.result.posts = res.result.posts.map((p) =>
      normalizePost(p as unknown as Record<string, unknown>)
    );
  }
  return res;
};

export const createPost = async (postData: CreatePostRequest): Promise<CreatePostResponse> => {
  return makeApiRequest<CreatePostResponse>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

export const updatePost = async (
  postId: number,
  postData: UpdatePostRequest
): Promise<UpdatePostResponse> => {
  return makeApiRequest<UpdatePostResponse>(`/api/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(postData),
  });
};

export const deletePost = async (postId: number): Promise<DeletePostResponse> => {
  return makeApiRequest<DeletePostResponse>(`/api/posts/${postId}`, {
    method: 'DELETE',
  });
};

export const likePost = async (postId: number): Promise<LikePostResponse> => {
  const res = await makeApiRequest<LikePostResponse>(`/api/posts/like/${postId}`, {
    method: 'POST',
  });
  if (res.isSuccess && res.result) {
    res.result = normalizeLikeResult(res.result as unknown as Record<string, unknown>);
  }
  return res;
};

export const unlikePost = async (postId: number): Promise<LikePostResponse> => {
  const res = await makeApiRequest<LikePostResponse>(`/api/posts/unlike/${postId}`, {
    method: 'POST',
  });
  if (res.isSuccess && res.result) {
    res.result = normalizeLikeResult(res.result as unknown as Record<string, unknown>);
  }
  return res;
};

export const publishPost = async (postId: number): Promise<PublishPostResponse> => {
  return makeApiRequest<PublishPostResponse>(`/api/posts/${postId}/publish`, {
    method: 'POST',
  });
};

export const unpublishPost = async (postId: number): Promise<UnpublishPostResponse> => {
  return makeApiRequest<UnpublishPostResponse>(`/api/posts/${postId}/unpublish`, {
    method: 'POST',
  });
};

export const createPostImagePresignedUrl = async (
  contentType: string
): Promise<CreatePostImageResponse> => {
  return makeApiRequest<CreatePostImageResponse>('/api/posts/image', {
    method: 'POST',
    body: JSON.stringify({ contentType }),
  });
};

export const uploadPostImage = async (file: File): Promise<string> => {
  const res = await createPostImagePresignedUrl(file.type);
  if (!res.isSuccess || !res.result?.presignedUrl || !res.result?.publicUrl) {
    throw new Error(res.message || '게시글 이미지 URL 발급에 실패했습니다.');
  }
  const { presignedUrl, publicUrl } = res.result;
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error(`이미지 업로드 실패: ${uploadResponse.statusText}`);
  }
  return publicUrl;
};
