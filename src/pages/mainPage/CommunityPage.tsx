import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { SkeletonList, SkeletonCommunityPost, SkeletonFriendsCard, SkeletonCommunityCardsGrid, SkeletonHorizontalRow } from '../../components/SkeletonUI';
import {
  getPostFeed,
  getFollowingPostFeed,
  getCards,
  getFollowingCards,
  type PaginationQueryParams,
  type Card,
} from '../../api/explore/exploreApi';
import { PATH } from '../../config/routes';
import type { Post } from '../../api/types/community';
import { getCurrentUserId } from '../../api/auth/authApi';
import CommunityPostItem from '../../components/CommunityPage/CommunityPostItem';
import './CommunityPage.css';
import { SectionErrorBanner } from '../../components/SectionErrorBanner';
import { useMinLoadingDuration } from '../../utils/useMinLoadingDuration';

type CommunityTab = 'subscription' | 'recommended';

const CARD_EXCERPT_MAX = 28;

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)} ...`;
}

function CommunityPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CommunityTab>('subscription');
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const showPostsLoading = useMinLoadingDuration(isLoading && posts.length === 0);
  const showCardsLoading = useMinLoadingDuration(cardsLoading);

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore || isLoading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0] && entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });

    if (node) {
      observer.current.observe(node);
    }
  }, [loadingMore, isLoading, hasMore]);

  const loadPosts = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params: PaginationQueryParams = {
        page: page,
        size: 10,
        sort: 'newest',
      };

      const fetchFeed = activeTab === 'subscription' ? getFollowingPostFeed : getPostFeed;
      const response = await fetchFeed(params);

      if (response.isSuccess && response.result) {
        const newPosts = response.result.posts;

        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
        }

        setHasMore(page < response.result.totalPages);
        setCurrentPage(page);
      } else {
        throw new Error(response.message || '게시글을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  const loadCards = useCallback(async () => {
    try {
      setCardsLoading(true);

      const params: PaginationQueryParams = {
        page: 1,
        size: activeTab === 'subscription' ? 12 : 6,
        sort: 'newest',
      };

      const fetchCards = activeTab === 'subscription' ? getFollowingCards : getCards;
      const response = await fetchCards(params);

      if (response.isSuccess && response.result) {
        setCards(response.result.cards);
      } else {
        setCards([]);
      }
    } catch {
      setCards([]);
    } finally {
      setCardsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    void loadPosts(1, true);
  }, [activeTab, loadPosts]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  useEffect(() => {
    if (currentPage > 1 && hasMore) {
      void loadPosts(currentPage, false);
    }
  }, [currentPage, hasMore, loadPosts]);

  const handleProfileClick = () => {
    navigate('/my-page');
  };

  const handleMoreCardsClick = () => {
    navigate(PATH.COMMUNITY_READING_CARDS, {
      state: { feed: activeTab === 'subscription' ? 'following' : 'all' },
    });
  };

  const handlePostClick = (postId: number, post: Post) => {
    const currentUserId = getCurrentUserId();
    const isMyPost = currentUserId !== null && post.author.id === currentUserId;

    if (isMyPost) {
      navigate(`/my-community/post/${postId}`);
    } else {
      navigate(`/community/post/${postId}`);
    }
  };

  const handleRefresh = () => {
    loadPosts(1, true);
  };

  const handleCardClick = (cardId: number) => {
    navigate(`/reading-card-detail/${cardId}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}`;
  };

  const getPostImageUrl = (post: Post): string | null => {
    const p = post as Post & { images?: string[]; imageUrl?: string; cardImage?: string };
    if (p.images && p.images.length > 0 && p.images[0] && p.images[0].trim() !== '') return p.images[0];
    if (post.thumbnail && post.thumbnail.trim() !== '') return post.thumbnail;
    if (p.imageUrl && p.imageUrl.trim() !== '') return p.imageUrl;
    if (p.cardImage && p.cardImage.trim() !== '') return p.cardImage;
    return null;
  };

  const renderPostsList = () => {
    if (showPostsLoading) {
      return (
        <div className="community-posts-loading">
          <SkeletonList count={2}>
            <SkeletonCommunityPost />
          </SkeletonList>
        </div>
      );
    }

    return (
      <div className="community-posts-list">
        {posts.map((post, index) => {
          const isLastElement = posts.length === index + 1;
          const postProps = {
            post,
            imageUrl: getPostImageUrl(post),
            formattedDate: formatDate(post.createdAt),
            onClick: () => handlePostClick(post.postId, post),
            ...(isLastElement && hasMore ? { innerRef: lastPostElementRef } : {}),
          };
          return <CommunityPostItem key={post.postId} {...postProps} />;
        })}

        {loadingMore && (
          <p className="community-loading-more">더 많은 게시글을 불러오는 중...</p>
        )}

        {!isLoading && posts.length === 0 && !error && (
          <div className="community-no-posts">
            <p>{activeTab === 'subscription' ? '구독 중인 친구의 게시글이 없어요' : '아직 게시글이 없습니다.'}</p>
            {activeTab !== 'subscription' && <p>첫 번째 게시글을 작성해보세요!</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container community-page">
      <TopBar onProfileClick={handleProfileClick} />

      <div className="header-margin" />

      <div className="community-content">
        <div className="community-tabs-wrap">
          <div className="community-tabs" role="tablist" aria-label="커뮤니티 피드">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'subscription'}
              className={`community-tab ${activeTab === 'subscription' ? 'community-tab--active' : ''}`}
              onClick={() => setActiveTab('subscription')}
            >
              구독
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'recommended'}
              className={`community-tab ${activeTab === 'recommended' ? 'community-tab--active' : ''}`}
              onClick={() => setActiveTab('recommended')}
            >
              추천
            </button>
          </div>
          <div className="community-tabs-divider" />
        </div>

        {error && (
          <SectionErrorBanner message={error} onRetry={handleRefresh} />
        )}

        {activeTab === 'subscription' ? (
          <div className="community-tab-panel">
            <section className="friends-cards-section">
              <div className="friends-cards-header">
                <h2 className="friends-cards-title">친구들의 독서카드</h2>
                <button
                  type="button"
                  className="friends-cards-link"
                  onClick={handleMoreCardsClick}
                >
                  독서카드 보러가기
                  <span className="friends-cards-chevron" aria-hidden />
                </button>
              </div>

              {showCardsLoading ? (
                <div className="friends-cards-loading">
                  <SkeletonHorizontalRow count={4}>
                    <SkeletonFriendsCard />
                  </SkeletonHorizontalRow>
                </div>
              ) : (
                <div className="friends-cards-scroll">
                  {cards.length > 0 ? (
                    cards.map((card) => (
                      <button
                        key={card.cardId}
                        type="button"
                        className="friends-card-item"
                        onClick={() => handleCardClick(card.cardId)}
                      >
                        <div
                          className="friends-card-thumb"
                          style={{ backgroundImage: `url(${card.image})` }}
                        />
                        <p className="friends-card-excerpt">
                          {truncateText(card.content, CARD_EXCERPT_MAX)}
                        </p>
                      </button>
                    ))
                  ) : (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={`empty-${i}`} className="friends-card-item friends-card-item--empty">
                        <div className="friends-card-thumb" />
                        <p className="friends-card-excerpt"></p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>

            <section className="community-feed-section">
              {renderPostsList()}
            </section>
          </div>
        ) : (
          <div className="community-tab-panel community-tab-panel--recommended">
            <section className="reading-cards-section">
              <h2 className="reading-cards-section-title">독서카드</h2>

              {showCardsLoading ? (
                <div className="cards-loading">
                  <SkeletonCommunityCardsGrid count={6} />
                </div>
              ) : (
                <>
                  <div className="community-reading-cards-grid">
                    {Array.from({ length: 6 }).map((_, index) => {
                      const card = cards[index];
                      if (card) {
                        return (
                          <button
                            key={card.cardId}
                            type="button"
                            className="community-reading-card-item"
                            onClick={() => handleCardClick(card.cardId)}
                          >
                            <div
                              className="community-reading-card-image"
                              style={{ backgroundImage: `url(${card.image})` }}
                            />
                          </button>
                        );
                      }
                      return (
                        <div
                          key={`empty-${index}`}
                          className="community-reading-card-item community-reading-card-empty"
                        >
                          <div className="community-reading-card-image" />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="more-cards-button"
                    onClick={handleMoreCardsClick}
                  >
                    독서카드 더 보러가기
                  </button>
                </>
              )}
            </section>

            <section className="recommendations-section">
              <div className="recommendations-header">
                <h2 className="recommendations-section-title">이달의 추천글</h2>
                <p className="section-subtitle">다른 회원들의 글을 만나보세요</p>
              </div>
              {renderPostsList()}
            </section>
          </div>
        )}
      </div>

      <div className="main-page-margin" />
    </div>
  );
}

export default CommunityPage;
