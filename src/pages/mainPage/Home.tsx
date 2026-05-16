import { useState, useEffect, useRef, useCallback } from 'react';
import './Home.css';
import MyReadingCardSection from '../../components/HomePage/MyReadingCard';
import TodaysRecommendationSection from '../../components/HomePage/TodaysRecommendation';
import { useNavigate } from 'react-router-dom';
import { getMemberProfile } from '../../api/memberApi';
import { getAllBooks, type Book, type GetAllBooksQueryParams } from '../../api/bookApi';
import { SkeletonHeroSection } from '../../components/SkeletonUI';
import TopBar from '../../components/TopBar';
import { FullPageErrorState } from '../../components/FullPageErrorState';
import sampleBookBackground from '../../assets/images/profileSample/sample_book_background.jpg';
import sampleBook from '../../assets/images/profileSample/sample_book.jpg';

const RECENT_BOOK_SLOTS = 5;
const HERO_ROTATE_MS = 5000;

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
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [selectedRecentIndex, setSelectedRecentIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heroRotateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          if (imageUrl) {
            localStorage.setItem('profileImage', imageUrl);
            window.dispatchEvent(
              new CustomEvent('profileUpdated', { detail: { profileImageUrl: imageUrl } })
            );
          } else {
            localStorage.removeItem('profileImage');
          }
        } else {
          setError(userResponse.message || "사용자 프로필을 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        setError('사용자 프로필을 불러오는 데 실패했습니다: ' + err.message);
      } finally {
        setIsUserDataLoading(false);
      }
    };

    const fetchRecentBooks = async () => {
      try {
        const params: GetAllBooksQueryParams = {
          page: 1,
          size: RECENT_BOOK_SLOTS,
          sort: 'newest',
        };
        const res = await getAllBooks(params);
        if (res.isSuccess && res.result?.memberBooks?.length) {
          setRecentBooks(res.result.memberBooks);
        }
      } catch {
        // keep empty list
      }
    };

    fetchUserProfile();
    fetchRecentBooks();
  }, []);

  useEffect(() => {
    setSelectedRecentIndex((prev) => {
      if (recentBooks.length === 0) return 0;
      return Math.min(prev, recentBooks.length - 1);
    });
  }, [recentBooks]);

  const clearHeroRotateTimer = useCallback(() => {
    if (heroRotateTimerRef.current !== null) {
      clearInterval(heroRotateTimerRef.current);
      heroRotateTimerRef.current = null;
    }
  }, []);

  const startHeroRotateTimer = useCallback(() => {
    clearHeroRotateTimer();
    if (recentBooks.length < 2) return;

    heroRotateTimerRef.current = setInterval(() => {
      setSelectedRecentIndex((prev) => (prev + 1) % recentBooks.length);
    }, HERO_ROTATE_MS);
  }, [recentBooks.length, clearHeroRotateTimer]);

  useEffect(() => {
    if (isHeroPaused || recentBooks.length < 2) {
      clearHeroRotateTimer();
      return;
    }

    startHeroRotateTimer();
    return clearHeroRotateTimer;
  }, [isHeroPaused, recentBooks.length, startHeroRotateTimer, clearHeroRotateTimer]);

  const handleSelectRecentBook = (index: number) => {
    setSelectedRecentIndex(index);
    if (!isHeroPaused) {
      startHeroRotateTimer();
    }
  };

  useEffect(() => {
    const onProfileUpdated = (e: Event) => {
      const url = (e as CustomEvent<{ profileImageUrl: string }>).detail?.profileImageUrl;
      if (url) {
        setUserData((prev) => (prev ? { ...prev, image: url } : null));
      }
    };
    window.addEventListener('profileUpdated', onProfileUpdated);
    return () => window.removeEventListener('profileUpdated', onProfileUpdated);
  }, []);

  const handleProfileClick = () => navigate('/my-page');
  const handleSearchClick = () => navigate('/book-search');

  const featured = recentBooks[selectedRecentIndex];
  const heroCoverSrc = featured?.imageUrl || sampleBook;
  const heroBlurSrc = featured?.imageUrl || sampleBookBackground;

  const handleHeroBlurError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== sampleBookBackground) {
      e.currentTarget.src = sampleBookBackground;
    }
  };

  const handleHeroCoverError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== sampleBook) {
      e.currentTarget.src = sampleBook;
    }
  };

  const handleThumbError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== sampleBook) {
      e.currentTarget.src = sampleBook;
    }
  };

  const handleContinueReading = () => {
    if (featured) {
      navigate(`/book-detail/${featured.memberBookId}`);
    } else {
      navigate('/book-search');
    }
  };

  if (error) {
    return (
      <FullPageErrorState
        title="홈을 불러오지 못했습니다"
        message={error}
        primaryAction={{ label: '다시 시도', onClick: () => window.location.reload() }}
        secondaryAction={{ label: '홈으로', onClick: () => navigate('/') }}
      />
    );
  }

  if (isUserDataLoading || !userData) {
    return (
      <div className="page-container">
        <TopBar onSearchClick={handleSearchClick} onProfileClick={handleProfileClick} />
        <div className="header-margin" />
        <div className="home-main">
          <SkeletonHeroSection />
          <MyReadingCardSection />
          <TodaysRecommendationSection />
        </div>
        <div className='main-page-margin' />
      </div>
    );
  }

  return (
    <div className="page-container">
      <TopBar onSearchClick={handleSearchClick} onProfileClick={handleProfileClick} />
      <div className="home-main">
        <div
          className="library-hero-section"
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
          onFocusCapture={() => setIsHeroPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setIsHeroPaused(false);
            }
          }}
        >
          <div className="library-hero-stack">
            <div className="library-hero-card">
              <div
                className="library-hero-card-slide"
                key={featured?.memberBookId ?? `hero-${selectedRecentIndex}`}
              >
            <img
              className="library-hero-card-blur"
              src={heroBlurSrc}
              alt=""
              onError={handleHeroBlurError}
            />
            <div className="library-hero-card-dim" aria-hidden />
            <img
              className="library-hero-card-cover"
              src={heroCoverSrc}
              alt={featured?.title ?? ''}
              onError={handleHeroCoverError}
            />
            <div className="library-hero-card-text">
              <div className="library-hero-card-text-top">
                <div className="library-hero-name-row">
                  <span className="library-hero-nickname-pill">{userData.nickname}</span>
                  <span className="library-hero-nim">님</span>
                </div>
                <p className="library-hero-title">
                  {featured?.title ?? '최근에 읽은 책이 없어요'}
                </p>
                {featured ? (
                  <p className="library-hero-reading-line">을 읽고 계시네요!</p>
                ) : (
                  <p className="library-hero-reading-line library-hero-reading-line--muted">
                    책을 검색해 독서를 시작해보세요
                  </p>
                )}
              </div>
              <button
                type="button"
                className="library-hero-cta"
                onClick={handleContinueReading}
              >
                <span>이어서 읽으러 가기</span>
                <span className="library-hero-cta-chevron" aria-hidden />
              </button>
            </div>
              </div>
            </div>

            <div className="library-hero-thumbs" role="group" aria-label="최근 읽은 책">
            {Array.from({ length: RECENT_BOOK_SLOTS }, (_, i) => {
              const book = recentBooks[i];
              const isActive = i === selectedRecentIndex;
              return (
                <button
                  key={book?.memberBookId ?? `slot-${i}`}
                  type="button"
                  className={`library-hero-thumb${isActive ? ' library-hero-thumb--active' : ''}${!book ? ' library-hero-thumb--empty' : ''}`}
                  disabled={!book}
                  aria-pressed={book ? isActive : undefined}
                  aria-label={book ? `${book.title} 선택` : '빈 슬롯'}
                  onClick={() => book && handleSelectRecentBook(i)}
                >
                  {book ? (
                    <img
                      src={book.imageUrl}
                      alt=""
                      onError={handleThumbError}
                    />
                  ) : null}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        <MyReadingCardSection />
        <TodaysRecommendationSection />
      </div>

      <div className='main-page-margin'>
      </div>
    </div>
  );
}

export default LibraryPage;
