/** 탐색·커뮤니티 공개 카드 타입 */

export interface CardMember {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface ExploreCard {
  cardId: number;
  member: CardMember;
  bookTitle: string;
  content: string;
  image: string;
  created: string;
  isPublic: boolean;
}

export interface CardListResponse {
  cards: ExploreCard[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function normalizeExploreCard(raw: Record<string, unknown>): ExploreCard {
  return {
    cardId: raw.cardId as number,
    member: raw.member as CardMember,
    bookTitle: String(raw.bookTitle ?? ''),
    content: String(raw.content ?? ''),
    image: String(raw.image ?? ''),
    created: String(raw.created ?? raw.createdAt ?? ''),
    isPublic: Boolean(raw.isPublic ?? raw.public ?? true),
  };
}
