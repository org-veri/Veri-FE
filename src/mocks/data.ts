// src/mocks/data.ts
// 중앙 집중식 목업 데이터와 헬퍼들

export interface MockApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const createMockResponse = <T>(
  result: T,
  message: string = 'Mock 성공',
  code: string = '1000'
): MockApiResponse<T> => ({
  isSuccess: true,
  code,
  message,
  result
});

export const createMockError = (
  message: string = 'Mock 오류',
  code: string = '5000'
): MockApiResponse<null> => ({
  isSuccess: false,
  code,
  message,
  result: null
});

export const mockUser = {
  email: 'mock@example.com',
  nickname: '목업 사용자',
  image: 'https://placehold.co/100x100?text=User',
  numOfReadBook: 15,
  numOfCard: 42
};

export const mockBooks = [
  {
    bookId: 1,
    memberBookId: 1,
    title: '해리포터와 마법사의 돌, 해리포터와 마법사의 돌, 해리포터와 마법사의 돌, 해리포터와 마법사의 돌',
    author: 'J.K. 롤링',
    imageUrl: 'https://placehold.co/100x150?text=Harry+Potter',
    score: 5,
    startedAt: '2024-01-15T10:00:00.000Z',
    endedAt: '2024-02-20T10:00:00.000Z',
    status: 'DONE' as const,
    cardSummaries: [
      { cardId: 101, cardImage: 'https://placehold.co/100x100?text=Card1' },
      { cardId: 102, cardImage: 'https://placehold.co/100x100?text=Card2' }
    ]
  },
  {
    memberBookId: 2,
    title: '반지의 제왕',
    author: 'J.R.R. 톨킨',
    imageUrl: 'https://placehold.co/100x150?text=Lord+of+Rings',
    score: 4,
    startedAt: '2024-03-01T10:00:00.000Z',
    endedAt: '2024-04-15T10:00:00.000Z',
    status: 'DONE' as const,
    cardSummaries: [
      { cardId: 201, cardImage: 'https://placehold.co/100x100?text=Card3' }
    ]
  },
  {
    memberBookId: 3,
    title: '1984',
    author: '조지 오웰',
    imageUrl: 'https://placehold.co/100x150?text=1984',
    score: 0,
    startedAt: '2024-05-01T10:00:00.000Z',
    endedAt: '2024-05-01T10:00:00.000Z',
    status: 'READING' as const,
    cardSummaries: []
  },
  {
    memberBookId: 4,
    title: '동물농장',
    author: '조지 오웰',
    imageUrl: 'https://placehold.co/100x150?text=Animal+Farm',
    score: 0,
    startedAt: '2024-05-01T10:00:00.000Z',
    endedAt: '2024-05-01T10:00:00.000Z',
    status: 'NOT_START' as const,
    cardSummaries: []
  }
];

export const mockCards = [
  {
    cardId: 1,
    content: '해리포터의 첫 번째 마법 수업에서 배운 내용입니다. "윙가르디움 레비오사!" 주문을 외우며 마법의 세계에 첫 발을 내딛는 순간이었습니다.',
    image: 'https://placehold.co/150x200?text=Card1',
    created: '2024-01-20T14:30:00.000Z',
    isPublic: true
  },
  {
    cardId: 2,
    content: '반지의 제왕에서 가장 인상 깊었던 구절입니다. "모든 것이 끝나면, 새로운 시작이 있다"는 메시지가 마음에 남습니다.',
    image: 'https://placehold.co/150x200?text=Card2',
    created: '2024-03-10T16:45:00.000Z',
    isPublic: true
  },
  {
    cardId: 3,
    content: '1984를 읽으며 빅브라더의 감시 사회에 대한 경각심을 느꼈습니다. 자유의 소중함을 다시 한번 깨닫게 된 순간이었습니다.',
    image: 'https://placehold.co/150x200?text=Card3',
    created: '2024-05-05T11:20:00.000Z',
    isPublic: true
  }
];

export const mockSearchResults = [
  {
    title: '해리포터와 마법사의 돌, 해리포터와 마법사의 돌, 해리포터와 마법사의 돌, 해리포터와 마법사의 돌',
    author: 'J.K. 롤링',
    imageUrl: 'https://placehold.co/100x150?text=Harry+Potter',
    publisher: '문학수첩',
    isbn: '978-89-8281-002-8'
  },
  {
    title: '해리포터와 비밀의 방',
    author: 'J.K. 롤링',
    imageUrl: 'https://placehold.co/100x150?text=Harry+Potter+2',
    publisher: '문학수첩',
    isbn: '978-89-8281-003-5'
  },
  {
    title: '해리포터와 아즈카반의 죄수',
    author: 'J.K. 롤링',
    imageUrl: 'https://placehold.co/100x150?text=Harry+Potter+3',
    publisher: '문학수첩',
    isbn: '978-89-8281-004-2'
  }
];

export const mockPopularBooks = [
  {
    image: 'https://placehold.co/100x150?text=Popular+1',
    title: '세상의 마지막 기회',
    author: '김영하',
    publisher: '민음사',
    isbn: '978-89-374-1234-5'
  },
  {
    image: 'https://placehold.co/100x150?text=Popular+2',
    title: '미드나잇 라이브러리',
    author: '매트 헤이그',
    publisher: '인플루엔셜',
    isbn: '978-89-374-5678-9'
  },
  {
    image: 'https://placehold.co/100x150?text=Popular+3',
    title: '클린 코드',
    author: '로버트 C. 마틴',
    publisher: '인사이트',
    isbn: '978-89-374-9012-3'
  }
];

export const mockTodaysRecommendation = [
  {
    bookId: 1,
    title: '오늘의 추천 도서 1',
    author: '추천 작가 1',
    imageUrl: 'https://placehold.co/100x150?text=Recommend+1'
  },
  {
    bookId: 2,
    title: '오늘의 추천 도서 2',
    author: '추천 작가 2',
    imageUrl: 'https://placehold.co/100x150?text=Recommend+2'
  }
];

const mockJwtHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const mockJwtPayload = 'eyJpZCI6MSwiZXhwIjoxODkzNDU2MDAwfQ';

export const mockTokens = {
  accessToken: `${mockJwtHeader}.${mockJwtPayload}.mock-access-signature`,
  refreshToken: `${mockJwtHeader}.${mockJwtPayload}.mock-refresh-signature`
};

export const mockOcrResult = '이것은 목업 OCR 결과 텍스트입니다. 실제 이미지에서 추출된 것처럼 보입니다. 독서 카드에 사용할 수 있는 의미 있는 텍스트가 여기에 나타날 것입니다.';

export const mockImageUrl = 'https://placehold.co/300x400?text=Mock+Image';

export interface CommunityAuthor {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface CommunityBookInfo {
  title: string;
  author: string;
  imageUrl: string;
  publisher: string;
  isbn: string;
}

export interface CommunityPost {
  postId: number;
  title: string;
  content: string;
  thumbnail: string | null;
  author: CommunityAuthor;
  book?: CommunityBookInfo;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isPublic: boolean;
  isLiked?: boolean;
}

export interface CommunityCard {
  cardId: number;
  member: CommunityAuthor;
  bookTitle: string;
  content: string;
  image: string;
  created: string;
  isPublic: boolean;
}

export interface CommunityComment {
  commentId: number;
  content: string;
  author: CommunityAuthor;
  createdAt: string;
  isDeleted: boolean;
  parentCommentId?: number | null;
}

export const mockCommunityPosts = (): CommunityPost[] => [
  {
    postId: 1,
    title: '오늘 읽은 책에 대한 감상',
    content: '정말 좋은 책이었습니다. 특히 마지막 장면이 인상적이었어요.',
    author: {
      id: 1,
      nickname: '독서왕',
      profileImageUrl: '/images/profileSample/sample_user.png',
    },
    book: {
      title: '오늘 읽은 책',
      author: '작가A',
      imageUrl: '/images/cardSample/forest.jpg',
      publisher: '출판사A',
      isbn: '1234567890123',
    },
    likeCount: 15,
    commentCount: 3,
    createdAt: '2024-01-15T10:30:00Z',
    isPublic: true,
    thumbnail: '/images/cardSample/forest.jpg',
  },
  {
    postId: 2,
    title: '새로 발견한 작가의 작품들',
    content: '이번에 새로 알게 된 작가인데, 작품 스타일이 정말 독특해요.',
    author: {
      id: 2,
      nickname: '책벌레',
      profileImageUrl: '/images/profileSample/sample_user.png',
    },
    book: {
      title: '새로운 작품',
      author: '작가B',
      imageUrl: '/images/cardSample/sea.jpg',
      publisher: '출판사B',
      isbn: '9876543210987',
    },
    likeCount: 8,
    commentCount: 1,
    createdAt: '2024-01-14T15:20:00Z',
    isPublic: true,
    thumbnail: '/images/cardSample/sea.jpg',
  },
  {
    postId: 3,
    title: '독서 모임 후기',
    content: '이번 주 독서 모임에서 정말 좋은 이야기들을 나눴어요.',
    author: {
      id: 3,
      nickname: '독서모임장',
      profileImageUrl: '/images/profileSample/sample_user.png',
    },
    book: {
      title: '독서 모임 후기',
      author: '작가C',
      imageUrl: '/images/cardSample/sky.jpg',
      publisher: '출판사C',
      isbn: '1122334455667',
    },
    likeCount: 22,
    commentCount: 7,
    createdAt: '2024-01-13T20:45:00Z',
    isPublic: true,
    thumbnail: '/images/cardSample/sky.jpg',
  }
];

export const mockCommunityCards = (): CommunityCard[] => [
  {
    cardId: 1,
    member: {
      id: 1,
      nickname: '독서왕',
      profileImageUrl: '/images/profileSample/sample_user.png'
    },
    bookTitle: '오늘 읽은 책',
    content: '정말 좋은 책이었습니다. 특히 마지막 장면이 인상적이었어요.',
    image: '/images/cardSample/forest.jpg',
    created: '2024-01-15T10:30:00Z',
    isPublic: true
  },
  {
    cardId: 2,
    member: {
      id: 2,
      nickname: '책벌레',
      profileImageUrl: '/images/profileSample/sample_user.png'
    },
    bookTitle: '새로운 작품',
    content: '이번에 새로 알게 된 작가인데, 작품 스타일이 정말 독특해요.',
    image: '/images/cardSample/sea.jpg',
    created: '2024-01-14T15:20:00Z',
    isPublic: true
  },
  {
    cardId: 3,
    member: {
      id: 3,
      nickname: '독서모임장',
      profileImageUrl: '/images/profileSample/sample_user.png'
    },
    bookTitle: '독서 모임 후기',
    content: '이번 주 독서 모임에서 정말 좋은 이야기들을 나눴어요.',
    image: '/images/cardSample/sky.jpg',
    created: '2024-01-13T20:45:00Z',
    isPublic: true
  }
];

export const mockBookmarks = [
  {
    id: 1,
    bookId: 1,
    bookTitle: '해리포터와 마법사의 돌',
    bookAuthor: 'J.K. 롤링',
    bookCoverUrl: 'https://placehold.co/100x150?text=HP1',
    pageNumber: 45,
    note: '마법의 세계에 대한 첫 번째 인상',
    createdAt: '2024-01-15T10:30:00Z',
    isBookmarked: true,
  },
  {
    id: 2,
    bookId: 2,
    bookTitle: '1984',
    bookAuthor: '조지 오웰',
    bookCoverUrl: 'https://placehold.co/100x150?text=1984',
    pageNumber: 123,
    note: '빅브라더가 지켜보고 있다',
    createdAt: '2024-01-10T14:20:00Z',
    isBookmarked: true,
  },
  {
    id: 3,
    bookId: 3,
    bookTitle: '어린 왕자',
    bookAuthor: '생텍쥐페리',
    bookCoverUrl: 'https://placehold.co/100x150?text=Prince',
    pageNumber: 67,
    note: '가장 중요한 것은 눈에 보이지 않는다',
    createdAt: '2024-01-05T09:15:00Z',
    isBookmarked: true,
  },
  {
    id: 4,
    bookId: 4,
    bookTitle: '데미안',
    bookAuthor: '헤르만 헤세',
    bookCoverUrl: 'https://placehold.co/100x150?text=Demian',
    pageNumber: 89,
    note: '자아 발견의 여정',
    createdAt: '2023-12-28T16:45:00Z',
    isBookmarked: true,
  },
];
