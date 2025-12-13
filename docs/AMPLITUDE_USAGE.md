# Amplitude Analytics 사용 가이드

## 설치 완료

Amplitude 스크립트가 `index.html`에 추가되었습니다. 이제 모든 페이지에서 자동으로 기본 이벤트(페이지 뷰, 세션, 클릭 등)가 추적됩니다.

## 커스텀 이벤트 추적

### 기본 사용법

```typescript
import { trackEvent } from '../utils/amplitude';

// 간단한 이벤트 추적
trackEvent('Sign Up');

// 속성과 함께 이벤트 추적
trackEvent('Sign Up', { 
  method: 'kakao',
  timestamp: new Date().toISOString()
});
```

### 실제 사용 예시

#### 1. 로그인 이벤트 추적

`src/pages/LoginPage.tsx`에서:
```typescript
import { trackEvent } from '../utils/amplitude';

const handleKakaoLogin = async () => {
  // 로그인 버튼 클릭 추적
  trackEvent('Login Button Clicked', { method: 'kakao' });
  // ... 로그인 로직
};
```

`src/pages/OAuthCallbackPage.tsx`에서:
```typescript
import { trackEvent, setAmplitudeUserId } from '../utils/amplitude';

// 로그인 성공 시
const accessToken = await handleSocialLoginCallback('kakao', code, state);
setAccessToken(accessToken);

// 사용자 ID 설정 및 로그인 이벤트 추적
setAmplitudeUserId(userId); // userId는 API 응답에서 가져온 값
trackEvent('Sign Up', { 
  method: 'kakao',
  timestamp: new Date().toISOString()
});

navigate('/');
```

#### 2. 책 상세 페이지 조회 추적

```typescript
import { trackEvent } from '../utils/amplitude';

useEffect(() => {
  if (book) {
    trackEvent('Book View', {
      bookId: book.id,
      bookTitle: book.title,
      author: book.author
    });
  }
}, [book]);
```

#### 3. 독서 카드 생성 추적

```typescript
import { trackEvent } from '../utils/amplitude';

const handleCardCreate = async () => {
  try {
    const card = await createCard(cardData);
    trackEvent('Card Created', {
      cardId: card.id,
      bookId: card.bookId,
      hasImage: !!card.image,
      contentLength: card.content.length
    });
  } catch (error) {
    trackEvent('Card Creation Failed', {
      error: error.message
    });
  }
};
```

#### 4. 커뮤니티 게시글 작성 추적

```typescript
import { trackEvent } from '../utils/amplitude';

const handlePostSubmit = async () => {
  trackEvent('Post Created', {
    postId: post.id,
    bookId: post.bookId,
    hasImage: !!post.image,
    contentLength: post.content.length
  });
};
```

#### 5. 검색 이벤트 추적

```typescript
import { trackEvent } from '../utils/amplitude';

const handleSearch = (query: string) => {
  if (query.trim()) {
    trackEvent('Search', {
      query: query,
      searchType: 'book', // 또는 'card', 'community' 등
      resultCount: results.length
    });
  }
};
```

## 사용자 속성 설정

### 사용자 ID 설정
```typescript
import { setAmplitudeUserId } from '../utils/amplitude';

// 로그인 성공 시
setAmplitudeUserId(userId);
```

### 사용자 속성 설정
```typescript
import { setAmplitudeUserProperties } from '../utils/amplitude';

setAmplitudeUserProperties({
  name: user.name,
  email: user.email,
  membershipType: 'premium',
  joinDate: user.createdAt
});
```

## 주요 추천 이벤트

다음 이벤트들을 추적하는 것을 권장합니다:

- `Sign Up` - 회원가입
- `Login` - 로그인
- `Book View` - 책 상세 페이지 조회
- `Card Created` - 독서 카드 생성
- `Card Shared` - 카드 공유
- `Post Created` - 커뮤니티 게시글 작성
- `Post Liked` - 게시글 좋아요
- `Search` - 검색
- `Bookmark Added` - 북마크 추가
- `Profile Updated` - 프로필 수정

## 참고사항

- 모든 이벤트는 자동으로 타임스탬프가 추가됩니다
- 페이지 뷰, 세션, 클릭 등은 자동으로 추적됩니다 (autocapture 설정)
- 이벤트 속성은 객체 형태로 전달할 수 있습니다
- Amplitude가 초기화되지 않은 경우 콘솔에 경고가 표시됩니다

