/**
 * API 모듈 barrel — Swagger 도메인별 export
 *
 * | 도메인 | 경로 |
 * |--------|------|
 * | 인증 | `auth/authApi` |
 * | 책장 | `bookshelf/bookshelfApi`, `bookshelf/bookSearchApi`, `bookshelf/bookmarkApi` |
 * | 독서카드 | `cards/cardApi` |
 * | 멤버 | `member/memberApi` |
 * | 이미지/OCR | `images/imageApi`, `images/ocrApi` |
 * | 공유(게시글) | `community/postApi` |
 * | 공유(댓글) | `community/commentApi` |
 * | 탐색 | `explore/exploreApi` |
 * | 소셜 | `social/socialApi` |
 * | 알림 | `notifications/notificationApi` |
 */

export * from './apiClient';
export * from './types/community';
export * from './types/card';
export * from './auth/authApi';
export * from './bookshelf/bookshelfApi';
export * from './bookshelf/bookSearchApi';
export * from './bookshelf/bookmarkApi';
export * from './cards/cardApi';
export * from './member/memberApi';
export { uploadImage } from './images/imageApi';
export * from './images/ocrApi';
export * from './community/postApi';
export * from './community/commentApi';
export {
  getPostFeed,
  getCards,
  getFollowingPostFeed,
  getFollowingCards,
  getPopularBooks as getPopularBooksFromExplore,
  getPopularPosts,
  searchPublicReadings,
  type PaginationQueryParams,
  type GetPostFeedResponse,
  type GetCardsResponse,
  type Card,
  type CardListResponse as ExploreCardListResponse,
  type PopularBookItem,
  type PopularPostItem,
} from './explore/exploreApi';
export {
  getFollowStatus,
  followMember,
  unfollowMember,
  getFollowCounts,
  getMyFollowers,
  getMyFollowing,
  getMemberPublicProfile,
  getMemberPublicPosts,
  getMemberPublicCards,
  getMemberPublicReadings,
  type SocialMemberSummary,
  type MemberPublicProfile,
  type PublicReadingItem as SocialPublicReadingItem,
  type MemberReadingsResult,
  type GetFollowStatusResponse,
  type FollowActionResponse,
  type GetFollowCountsResponse,
  type GetFriendsListResponse,
  type GetMemberPublicProfileResponse,
  type GetMemberPostsResponse,
  type GetMemberCardsResponse,
  type GetMemberReadingsResponse,
  type MemberContentQueryParams,
} from './social/socialApi';
export * from './notifications/notificationApi';
