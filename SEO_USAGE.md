# Open Graph (OG) 태그 설정 가이드

Veri 앱에서 SNS 미리보기 최적화를 위한 Open Graph 태그 설정 방법입니다.

## 설치된 패키지

- `react-helmet-async`: React 앱에서 동적으로 메타 태그를 관리할 수 있는 라이브러리

## 기본 설정

### 1. index.html
기본 Open Graph 태그가 `index.html`에 설정되어 있습니다. 모든 페이지에서 기본값으로 사용됩니다.

### 2. SEO 컴포넌트
`src/components/SEO.tsx` 파일에서 페이지별로 동적인 메타 태그를 설정할 수 있습니다.

## 사용 방법

### 기본 사용법

```tsx
import SEO from '../components/SEO';

function MyPage() {
  return (
    <>
      <SEO 
        title="페이지 제목"
        description="페이지 설명"
      />
      {/* 페이지 콘텐츠 */}
    </>
  );
}
```

### 전체 옵션 사용 예시

```tsx
import SEO from '../components/SEO';

function BookDetailPage({ book }) {
  const bookImageUrl = book.image || 'https://example.com/default-book.jpg';
  const pageUrl = `https://veri.me.kr/book-detail/${book.id}`;
  
  return (
    <>
      <SEO 
        title={`${book.title} - Veri`}
        description={`${book.author}의 "${book.title}"을 읽고 기록을 남겨보세요`}
        image={bookImageUrl}
        url={pageUrl}
        type="article"
        twitterCard="summary_large_image"
      />
      {/* 페이지 콘텐츠 */}
    </>
  );
}
```

### 모바일 앱 링크 설정 (선택사항)

앱이 있다면 다음처럼 설정할 수 있습니다:

```tsx
<SEO 
  title="앱으로 열기"
  description="Veri 앱에서 열기"
  iosAppStoreId="123456789"
  iosAppName="Veri"
  iosUrl="veri://book/123"
  androidPackage="kr.me.veri"
  androidAppName="Veri"
  androidUrl="veri://book/123"
  webUrl="https://veri.me.kr/book/123"
/>
```

## SEO 컴포넌트 Props

| Prop | Type | 기본값 | 설명 |
|------|------|--------|------|
| `title` | string | '나만의 문장을 수확하다, Veri' | 페이지 제목 |
| `description` | string | '책 속 문장을 기록하고 나만의 읽기 기록을 만들어보세요' | 페이지 설명 |
| `image` | string | (기본 아이콘) | OG 이미지 URL (1200x630 권장) |
| `url` | string | (현재 URL) | 페이지 URL |
| `type` | string | 'website' | OG 타입 (website, article 등) |
| `siteName` | string | 'Veri' | 사이트 이름 |
| `twitterCard` | string | 'summary_large_image' | Twitter 카드 타입 |
| `iosAppStoreId` | string | - | iOS 앱스토어 ID (선택) |
| `iosAppName` | string | - | iOS 앱 이름 (선택) |
| `iosUrl` | string | - | iOS 딥링크 URL (선택) |
| `androidPackage` | string | - | Android 패키지명 (선택) |
| `androidAppName` | string | - | Android 앱 이름 (선택) |
| `androidUrl` | string | - | Android 딥링크 URL (선택) |
| `webUrl` | string | - | 웹 URL (선택) |

## 이미지 가이드라인

- **최소 크기**: 600 x 315 픽셀
- **권장 크기**: 1200 x 630 픽셀
- **형식**: JPG, PNG
- **파일 크기**: 8MB 이하 (Facebook 권장)

## 페이지별 적용 예시

### 홈 페이지
```tsx
<SEO 
  title="나만의 문장을 수확하다, Veri"
  description="책 속 문장을 기록하고 나만의 읽기 기록을 만들어보세요"
/>
```

### 책 상세 페이지
```tsx
<SEO 
  title={`${book.title} - Veri`}
  description={`${book.author}의 "${book.title}"`}
  image={book.coverImage}
  url={`https://veri.me.kr/book-detail/${book.id}`}
  type="article"
/>
```

### 읽기 카드 상세 페이지
```tsx
<SEO 
  title={`${card.title} - Veri`}
  description={card.content?.substring(0, 100) + '...'}
  image={card.image}
  url={`https://veri.me.kr/reading-card-detail/${card.id}`}
  type="article"
/>
```

### 커뮤니티 게시글 페이지
```tsx
<SEO 
  title={`${post.title} - Veri 커뮤니티`}
  description={post.content?.substring(0, 150) + '...'}
  image={post.image || post.bookCover}
  url={`https://veri.me.kr/community/post/${post.id}`}
  type="article"
/>
```

## 테스트 방법

1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
4. **Naver Search Advisor**: https://searchadvisor.naver.com/

## 주의사항

- 이미지 URL은 반드시 **절대 경로**로 설정해야 합니다
- 이미지가 HTTPS로 제공되어야 합니다
- SNS 크롤러가 접근할 수 있는 공개 URL이어야 합니다
- 메타 태그 변경 후 SNS 캐시를 클리어해야 할 수 있습니다 (위의 테스트 도구 사용)

## 환경변수 설정 (선택)

실제 도메인 URL을 환경변수로 관리하려면 `.env` 파일에 추가:

```env
VITE_SITE_URL=https://veri.me.kr
```

그리고 SEO 컴포넌트에서 사용:

```tsx
const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
```
