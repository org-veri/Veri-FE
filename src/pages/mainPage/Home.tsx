import { useState, useEffect, useRef } from 'react';
import './Home.css';
import MyReadingCardSection from '../../components/HomePage/MyReadingCard';
import TodaysRecommendationSection from '../../components/HomePage/TodaysRecommendation';
import { useNavigate } from 'react-router-dom';
import { getMemberProfile } from '../../api/memberApi';
import { getAllBooks, type GetAllBooksQueryParams } from '../../api/bookApi';
import { SkeletonHeroSection } from '../../components/SkeletonUI';

import unionIcon from '../../assets/icons/TopBar/union.svg';
import profileIcon from '../../assets/icons/TopBar/profile.svg';

import sampleBookBackground from '../../assets/images/profileSample/sample_book_background.jpg';
import sampleBook from '../../assets/images/profileSample/sample_book.jpg';
import sampleUser from '../../assets/images/profileSample/sample_user.png';

interface UserData {
  email: string;
  nickname: string;
  image: string;
  numOfReadBook: number;
  numOfCard: number;
}

function LibraryPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bookImageUrl, setBookImageUrl] = useState<string | null>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    // localStorage에서 프로필 이미지 가져오기
    const storedImage = localStorage.getItem('profileImage');
    return storedImage || null;
  });
  
  // 이미지 에러 핸들링을 위한 refs
  const heroBackgroundErrorRef = useRef(false);
  const heroBookSampleErrorRef = useRef(false);
  const profileImageErrorRef = useRef(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userResponse = await getMemberProfile();
        if (userResponse.isSuccess && userResponse.result) {
          const imageUrl = userResponse.result.image;
          setUserData({
            email: userResponse.result.email,
            nickname: userResponse.result.nickname,
            image: imageUrl,
            numOfReadBook: userResponse.result.numOfReadBook,
            numOfCard: userResponse.result.numOfCard,
          });
          // localStorage에 프로필 이미지 저장
          if (imageUrl) {
            localStorage.setItem('profileImage', imageUrl);
            setProfileImage(imageUrl);
          } else {
            localStorage.removeItem('profileImage');
            setProfileImage(null);
          }
        } else {
          setError(userResponse.message || "사용자 프로필을 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('사용자 프로필 로딩 오류:', err);
        setError('사용자 프로필을 불러오는 데 실패했습니다: ' + err.message);
      } finally {
        setIsUserDataLoading(false);
      }
    };

    // userData는 항상 가져오되, 프로필 이미지는 localStorage에서 우선 사용
    fetchUserProfile();

    const fetchRecentBook = async () => {
      try {
        const recentBooksParams: GetAllBooksQueryParams = {
          page: 1,
          size: 1,
          sort: 'newest',
        };
        const recentBooksResponse = await getAllBooks(recentBooksParams);

        if (recentBooksResponse.isSuccess &&
          recentBooksResponse.result?.memberBooks.length > 0) {
          const mostRecentBook = recentBooksResponse.result.memberBooks[0];
          if (mostRecentBook) {
            setBookImageUrl(mostRecentBook.imageUrl);
          }
        }
      } catch (err: any) {
        console.error('최근 책 데이터 로딩 오류:', err);
        // 책 데이터는 실패해도 사용자에게 오류를 보여주지 않음
      }
    };

    // 병렬로 데이터 fetch
    fetchUserProfile();
    fetchRecentBook();
  }, []);

  const handleProfileClick = () => navigate('/my-page');
  const handleSearchClick = () => navigate('/book-search');

  // 에러 상태 처리
  if (error) {
    return <div className="loading-page-container"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  // 사용자 데이터 로딩 중이거나 데이터 없음 상태 처리
  if (isUserDataLoading || !userData) {
    return (
      <div className="page-container">
        <SkeletonHeroSection />
        <MyReadingCardSection />
        <TodaysRecommendationSection />
        <div className='main-page-margin' />
      </div>
    );
  }

  // 이미지 경로 설정
  const heroBackgroundImageSrc = bookImageUrl || sampleBookBackground;
  const heroBookSampleImageSrc = bookImageUrl || sampleBook;
  const hasValidProfileImage = userData.image &&
    userData.image.trim() !== '' &&
    userData.image !== 'https://example.com/image.jpg';

  // 이미지 에러 핸들러
  const handleHeroBackgroundError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!heroBackgroundErrorRef.current && e.currentTarget.src !== sampleBookBackground) {
      heroBackgroundErrorRef.current = true;
      e.currentTarget.src = sampleBookBackground;
    }
  };

  const handleHeroBookSampleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!heroBookSampleErrorRef.current && e.currentTarget.src !== sampleBook) {
      heroBookSampleErrorRef.current = true;
      e.currentTarget.src = sampleBook;
    }
  };

  const handleProfileImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!profileImageErrorRef.current) {
      profileImageErrorRef.current = true;
      // 프로필 이미지 에러 시 placeholder로 전환
      e.currentTarget.style.display = 'none';
      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
      if (placeholder && placeholder.classList.contains('profile-placeholder')) {
        placeholder.style.display = 'block';
      }
    }
  };

  return (
    <div className="page-container">
      <div className="library-hero-section">
        <img
          src={heroBackgroundImageSrc}
          className="hero-background"
          alt="Hero background"
          onError={handleHeroBackgroundError}
        />
        <header className="hero-header">
          <button 
            type="button" 
            className="main-icon" 
            onClick={() => navigate('/')}
            aria-label="홈으로 이동"
          >
            <img src={unionIcon} alt="홈" />
          </button>
          <div className="header-icons">
            <button
              type="button"
              className="search-button"
              aria-label="검색"
              onClick={handleSearchClick}
            >
              <span className="mgc_search_2_fill"></span>
            </button>
            <button
              type="button"
              className="notification-button"
              aria-label="알림"
            >
              <span className="mgc_notification_fill"></span>
            </button>
            <button
              type="button"
              className="my-page-button"
              aria-label="프로필 보기"
              onClick={handleProfileClick}
            >
              {profileImage ? (
                <img src={profileImage} alt="프로필" className="profile-image" />
              ) : (
                <img src={profileIcon} alt="프로필" />
              )}
            </button>
          </div>
        </header>

        <div className="hero-content">
          <div className="hero-profile-row">
            <button
              className="profile-circle"
              onClick={handleProfileClick}
              aria-label="프로필 보기"
            >
              {hasValidProfileImage ? (
                <>
                  <img 
                    src={userData.image} 
                    className="profile-image" 
                    alt="프로필 이미지"
                    onError={handleProfileImageError}
                  />
                  <div
                    className="profile-placeholder"
                    style={{ backgroundImage: `url(${sampleUser})`, display: 'none' }}
                  />
                </>
              ) : (
                <div
                  className="profile-placeholder"
                  style={{ backgroundImage: `url(${sampleUser})` }}
                />
              )}
            </button>
            <div className="welcome-text">
              <h2>반가워요, {userData.nickname}님!</h2>
            </div>
          </div>
          <img
            src={heroBookSampleImageSrc}
            className="hero-book-sample"
            alt="Hero book sample"
            onError={handleHeroBookSampleError}
          />
        </div>
      </div>

      <MyReadingCardSection />
      <TodaysRecommendationSection />

      <div className='main-page-margin'>
      </div>
    </div>
  );
}

export default LibraryPage;
