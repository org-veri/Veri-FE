export const PATH = {
  LOGIN: '/login',
  OAUTH_CALLBACK: '/oauth/callback/kakao',
  HOME: '/',
  LIBRARY: '/library',
  READING_CARD: '/reading-card',
  COMMUNITY: '/community',
  MY_PAGE: '/my-page',
  BOOKMARK: '/bookmark',
  BOOK_DETAIL: '/book-detail',
  READING_CARD_DETAIL: '/reading-card-detail',
  COMMUNITY_POST: '/community/post',
  MY_COMMUNITY_POST: '/my-community/post',
  MAKE_CARD: '/make-card',
  TEXT_EXTRACTION_LOADING: '/text-extraction-loading',
  TEXT_EXTRACTION_RESULT: '/text-extraction-result',
  CUSTOMIZE_CARD: '/customize-card',
  CARD_COMPLETE: '/card-complete',
  BOOK_SEARCH: '/book-search',
  DOWNLOAD_CARD: '/download-card',
  BOOK_ADD: '/book-add',
  CARD_BOOK_SEARCH: '/card-book-search',
  CARD_BOOK_SEARCH_BEFORE: '/card-book-search-before',
  USE_PHOTO: '/use-photo',
  EDIT_MY_NAME: '/edit-my-name',
  WRITE_POST: '/write-post',
  POST_BOOK_SEARCH: '/post-book-search',
  COMMUNITY_READING_CARDS: '/community/reading-cards',
  POST_LIKES: '/post-likes',
} as const;

export const PATHS_PUBLIC: string[] = [PATH.LOGIN, PATH.OAUTH_CALLBACK];

export const PATHS_WITH_TAB_BAR: string[] = [
  PATH.HOME,
  PATH.LIBRARY,
  PATH.READING_CARD,
  PATH.COMMUNITY,
  PATH.MY_PAGE,
];

export function shouldShowTabBar(pathname: string): boolean {
  return PATHS_WITH_TAB_BAR.includes(pathname);
}

export function shouldShowSidebar(pathname: string): boolean {
  return !PATHS_PUBLIC.includes(pathname);
}

export function shouldShowFloatingCamera(_pathname: string): boolean {
  /* 중앙 탭 카메라로 이동 — 별도 플로팅 촬영 버튼 비활성 */
  return false;
}
