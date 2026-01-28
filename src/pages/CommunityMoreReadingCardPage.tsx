import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCards } from '../api/communityApi';
import type { Card, GetCardsQueryParams } from '../api/communityApi';
import './CommunityMoreReadingCardPage.css';

interface CardItemProps {
  card: Card;
  onCardClick: (cardId: number) => void;
  innerRef?: (node: HTMLDivElement | null) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onCardClick, innerRef }) => {
  const cardImageErrorRef = useRef(false);
  const profileImageErrorRef = useRef(false);
  
  const cardFallbackImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23E3E7ED"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
  const profileFallbackImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24"%3E%3Ccircle cx="12" cy="12" r="12" fill="%23E3E7ED"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3E%3F%3C/text%3E%3C/svg%3E';

  const handleCardImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!cardImageErrorRef.current && e.currentTarget.src !== cardFallbackImageUrl) {
      cardImageErrorRef.current = true;
      e.currentTarget.src = cardFallbackImageUrl;
    }
  };

  const handleProfileImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!profileImageErrorRef.current && e.currentTarget.src !== profileFallbackImageUrl) {
      profileImageErrorRef.current = true;
      e.currentTarget.src = profileFallbackImageUrl;
    }
  };

  return (
    <div 
      ref={innerRef}
      className="community-more-reading-card-item"
      onClick={() => onCardClick(card.cardId)}
    >
      <div className="community-more-card-image">
        <img 
          src={card.image || cardFallbackImageUrl}
          alt="독서카드 이미지"
          onError={handleCardImageError}
        />
      </div>

      <div className="card-info">
        <div className="card-user">
          <div className="user-avatar">
            <img 
              src={card.member.profileImageUrl || profileFallbackImageUrl}
              alt={card.member.nickname}
              onError={handleProfileImageError}
            />
          </div>
          <div className="user-name">{card.member.nickname}</div>
        </div>

        <div className="card-quote">
          {card.content.length > 50 
            ? card.content.substring(0, 50) + '...' 
            : card.content
          }
        </div>

        <div className="card-book">
          <span className="mgc_book_6_fill"></span>
          <span className="community-more-book-title">{card.bookTitle}</span>
        </div>
      </div>
    </div>
  );
};

function CommunityMoreReadingCardPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const loadCards = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (loadingMore || (!reset && !hasMore)) return;

    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const params: GetCardsQueryParams = {
        page: page,
        size: 12,
        sort: 'newest'
      };
      
      const response = await getCards(params);
      
      if (response.isSuccess && response.result) {
        const newCards = response.result.cards;
        
        if (reset) {
          setCards(newCards);
        } else {
          setCards(prevCards => [...prevCards, ...newCards]);
        }
        
        setHasMore(page < response.result.totalPages);
        setCurrentPage(page);
      } else {
        throw new Error(response.message || '독서카드를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('독서카드 로드 실패:', err);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    loadCards(1, true);
  }, []);

  useEffect(() => {
    if (currentPage > 1 && hasMore) {
      loadCards(currentPage, false);
    }
  }, [currentPage, hasMore, loadCards]);

  const lastCardElementRef = useCallback((node: HTMLDivElement | null) => {
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleCardClick = (cardId: number) => {
    // 독서카드 상세 페이지로 이동 (실제 구현 시 해당 페이지로 연결)
    navigate(`/reading-card-detail/${cardId}`);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    loadCards(1, true);
  };

  if (isLoading && cards.length === 0) {
    return (
      <div className="page-container">
        <header className="detail-header">
          <button className="header-left-arrow" onClick={handleBack}>
            <span className="mgc_left_fill"></span>
          </button>
          <h3>독서카드</h3>
          <div className="header-right-wrapper"></div>
        </header>

        <div className="header-margin"></div>

        <div className="reading-cards-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <header className="detail-header">
          <button className="header-left-arrow" onClick={handleBack}>
            <span className="mgc_left_fill"></span>
          </button>
          <h3>독서카드</h3>
          <div className="header-right-wrapper"></div>
        </header>

        <div className="header-margin"></div>

        <div className="reading-cards-page">
          <div className="error-container">
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-button">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="detail-header">
        <button className="header-left-arrow" onClick={handleBack}>
          <span className="mgc_left_fill"></span>
        </button>
        <h3>독서카드</h3>
        <div className="header-right-wrapper"></div>
      </header>

      <div className="header-margin"></div>

      <div className="reading-cards-page">
        <div className="community-more-reading-card-grid">
          {cards.map((card, index) => {
            const isLastElement = cards.length === index + 1;
            return (
              <CardItem
                key={card.cardId}
                card={card}
                onCardClick={handleCardClick}
                {...(isLastElement && hasMore && { innerRef: lastCardElementRef })}
              />
            );
          })}
        </div>

        {loadingMore && (
          <div className="loading-more-container">
            <p className="loading-message">더 많은 독서카드를 불러오는 중...</p>
          </div>
        )}

        {!isLoading && !loadingMore && cards.length === 0 && !error && (
          <div className="no-cards">
            <p>아직 독서카드가 없습니다.</p>
            <p>첫 번째 독서카드를 만들어보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityMoreReadingCardPage;
