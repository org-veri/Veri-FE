/**
 * 소셜 API — Swagger「공유」/social
 * 팔로우, 타인 프로필·공개 콘텐츠 조회
 */
import {
  API_BASE_URL,
  appendPaginationParams,
  makeApiRequest,
  type BaseApiResponse,
  type PostSortQuery,
} from '../apiClient';
import { normalizePost, type PostFeedResponse } from '../types/community';
import { normalizeExploreCard, type CardListResponse } from '../types/card';

export interface SocialMemberSummary {
  id: number;
  nickname: string;
  image: string;
  numOfReadBook: number;
  numOfCard: number;
}

export interface MemberPublicProfile {
  id: number;
  nickname: string;
  bio: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  following: boolean;
  followedBy: boolean;
  image: string;
  numOfReadBook: number;
  numOfCard: number;
}

export interface PublicReadingItem {
  id: number;
  bookId: number;
  title: string;
  author: string;
  imageUrl: string;
  score: number;
  startedAt: string;
  isPublic: boolean;
}

export interface MemberReadingsResult {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  readings: PublicReadingItem[];
}

export type GetFollowStatusResponse = BaseApiResponse<{ following: boolean }>;
export type FollowActionResponse = BaseApiResponse<Record<string, never>>;
export type GetFollowCountsResponse = BaseApiResponse<{
  followerCount: number;
  followingCount: number;
}>;
export type GetFriendsListResponse = BaseApiResponse<{ friends: SocialMemberSummary[] }>;
export type GetMemberPublicProfileResponse = BaseApiResponse<MemberPublicProfile>;
export type GetMemberPostsResponse = BaseApiResponse<PostFeedResponse>;
export type GetMemberCardsResponse = BaseApiResponse<CardListResponse>;
export type GetMemberReadingsResponse = BaseApiResponse<MemberReadingsResult>;

export interface MemberContentQueryParams {
  page?: number;
  size?: number;
  sort?: PostSortQuery;
}

export const getFollowStatus = async (memberId: number): Promise<GetFollowStatusResponse> => {
  return makeApiRequest<GetFollowStatusResponse>(`/api/social/members/${memberId}/follow`);
};

export const followMember = async (memberId: number): Promise<FollowActionResponse> => {
  return makeApiRequest<FollowActionResponse>(`/api/social/members/${memberId}/follow`, {
    method: 'POST',
  });
};

export const unfollowMember = async (memberId: number): Promise<FollowActionResponse> => {
  return makeApiRequest<FollowActionResponse>(`/api/social/members/${memberId}/follow`, {
    method: 'DELETE',
  });
};

export const getFollowCounts = async (memberId: number): Promise<GetFollowCountsResponse> => {
  return makeApiRequest<GetFollowCountsResponse>(
    `/api/social/members/${memberId}/follow-counts`
  );
};

export const getMyFollowers = async (): Promise<GetFriendsListResponse> => {
  return makeApiRequest<GetFriendsListResponse>('/api/social/members/followers');
};

export const getMyFollowing = async (): Promise<GetFriendsListResponse> => {
  return makeApiRequest<GetFriendsListResponse>('/api/social/members/following');
};

/** GET /api/social/members/{memberId} — 타인 정보 간단 조회 */
export const getMemberPublicProfile = async (
  memberId: number
): Promise<GetMemberPublicProfileResponse> => {
  return makeApiRequest<GetMemberPublicProfileResponse>(`/api/social/members/${memberId}`);
};

/** GET /api/social/members/{memberId}/posts */
export const getMemberPublicPosts = async (
  memberId: number,
  params: MemberContentQueryParams = {}
): Promise<GetMemberPostsResponse> => {
  const url = new URL(`/api/social/members/${memberId}/posts`, API_BASE_URL);
  appendPaginationParams(url, params);
  const res = await makeApiRequest<GetMemberPostsResponse>(url.pathname + url.search);
  if (res.isSuccess && res.result?.posts) {
    res.result.posts = res.result.posts.map((p) =>
      normalizePost(p as unknown as Record<string, unknown>)
    );
  }
  return res;
};

/** GET /api/social/members/{memberId}/cards */
export const getMemberPublicCards = async (
  memberId: number,
  params: MemberContentQueryParams = {}
): Promise<GetMemberCardsResponse> => {
  const url = new URL(`/api/social/members/${memberId}/cards`, API_BASE_URL);
  appendPaginationParams(url, params);
  const res = await makeApiRequest<GetMemberCardsResponse>(url.pathname + url.search);
  if (res.isSuccess && res.result?.cards) {
    res.result.cards = res.result.cards.map((c) =>
      normalizeExploreCard(c as unknown as Record<string, unknown>)
    );
  }
  return res;
};

/** GET /api/social/members/{memberId}/readings */
export const getMemberPublicReadings = async (
  memberId: number,
  params: MemberContentQueryParams = {}
): Promise<GetMemberReadingsResponse> => {
  const url = new URL(`/api/social/members/${memberId}/readings`, API_BASE_URL);
  appendPaginationParams(url, params);
  const res = await makeApiRequest<GetMemberReadingsResponse>(url.pathname + url.search);
  if (res.isSuccess && res.result?.readings) {
    res.result.readings = res.result.readings.map((r) => ({
      ...r,
      isPublic: Boolean((r as PublicReadingItem & { public?: boolean }).isPublic ?? (r as { public?: boolean }).public ?? true),
    }));
  }
  return res;
};
