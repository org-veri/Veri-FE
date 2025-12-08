// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  // 모바일 앱 관련 (선택사항)
  iosAppStoreId?: string;
  iosAppName?: string;
  iosUrl?: string;
  androidPackage?: string;
  androidAppName?: string;
  androidUrl?: string;
  webUrl?: string;
}

const SEO = ({
  title = '나만의 문장을 수확하다, Veri',
  description = '책 속 문장을 기록하고 나만의 읽기 기록을 만들어보세요',
  image = 'https://3-veri-s3-bucket.s3.ap-northeast-2.amazonaws.com/assets/union.png',
  url,
  type = 'website',
  siteName = 'Veri',
  twitterCard = 'summary_large_image',
  iosAppStoreId,
  iosAppName,
  iosUrl,
  androidPackage,
  androidAppName,
  androidUrl,
  webUrl,
}: SEOProps) => {
  // 현재 URL 가져오기
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* 기본 메타 태그 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph 메타 태그 */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="ko_KR" />
      
      {/* Twitter Card 메타 태그 */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* iOS 앱 링크 (선택사항) */}
      {iosUrl && <meta property="al:ios:url" content={iosUrl} />}
      {iosAppStoreId && <meta property="al:ios:app_store_id" content={iosAppStoreId} />}
      {iosAppName && <meta property="al:ios:app_name" content={iosAppName} />}
      
      {/* Android 앱 링크 (선택사항) */}
      {androidUrl && <meta property="al:android:url" content={androidUrl} />}
      {androidAppName && <meta property="al:android:app_name" content={androidAppName} />}
      {androidPackage && <meta property="al:android:package" content={androidPackage} />}
      {webUrl && <meta property="al:web:url" content={webUrl} />}
    </Helmet>
  );
};

export default SEO;
