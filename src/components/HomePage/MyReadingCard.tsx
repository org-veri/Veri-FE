// src/components/HomePage/MyReadingCard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyReadingCard.css';
import { getMyCards, type MyCardItem, type GetMyCardsQueryParams } from '../../api/cardApi';

interface ReadingCardItemType {
  id: string;
  coverUrl: string;
  title: string;
  readingDate: string;
  contentPreview: string;
}

const SingleReadingCard: React.FC<ReadingCardItemType> = ({ id, coverUrl, title, contentPreview }) => {
  const navigate = useNavigate();
  const fallbackImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="150"%3E%3Crect width="100" height="150" fill="%23E3E7ED"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
  const hasErrorRef = React.useRef(false);

  const handleCardClick = () => {
    navigate(`/reading-card-detail/${id}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasErrorRef.current && e.currentTarget.src !== fallbackImageUrl) {
      hasErrorRef.current = true;
      e.currentTarget.src = fallbackImageUrl;
    }
  };

  return (
    <div className="readingCardItem" onClick={handleCardClick}>
      <div className="cardThumbnail">
        <img
          src={coverUrl || fallbackImageUrl}
          alt={title || '독서 카드 이미지'}
          onError={handleImageError}
        />
      </div>
      <p className="cardText">{contentPreview}</p>
    </div>
  );
};

const MyReadingCardSection: React.FC = () => {
  const navigate = useNavigate();
  const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams: GetMyCardsQueryParams = {
          page: 1,
          size: 5,
          sort: 'newest',
        };
        const response = await getMyCards(queryParams);

        if (response.isSuccess) {
          if (response.result && Array.isArray(response.result.cards)) {
            const mappedCards: ReadingCardItemType[] = response.result.cards.map((card: MyCardItem) => ({
              id: String(card.cardId),
              coverUrl: card.image,
              title: "책 제목 정보 없음",
              readingDate: "날짜 정보 없음",
              contentPreview: card.content.length > 50 ? card.content.substring(0, 50) + '...' : card.content,
            }));
            setReadingCards(mappedCards);
          } else {
            console.warn("API는 성공을 반환했지만, 카드 데이터가 없거나 형식이 잘못되었습니다:", response);
            setReadingCards([]);
            setError("독서 카드를 불러왔으나, 표시할 내용이 없습니다.");
          }
        } else {
          setError(response.message || "독서 카드를 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('독서 카드를 불러오는 중 오류 발생:', err);
        setError(`독서 카드를 불러오는 데 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (isLoading) {
    return (
      <section className="myReadingCards">
        <div className="sectionHeader">
          <p>나의 독서카드</p>
          <span className="moreLink" onClick={() => navigate('/reading-card')}>
            독서카드 보러가기 <span className="mgc_right_line"></span>
          </span>
        </div>
        <div className="horizontalScrollContainer">
          <p className="loadingMessage">독서 카드를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="myReadingCards">
        <div className="sectionHeader">
          <p>나의 독서카드</p>
          <span className="moreLink" onClick={() => navigate('/reading-card')}>
            독서카드 보러가기 <span className="mgc_right_line"></span>
          </span>
        </div>
        <div className="horizontalScrollContainer">
          <p className="errorMessage">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="myReadingCards">
      <div className="sectionHeader">
        <p>나의 독서카드</p>
        <span className="moreLink" onClick={() => navigate('/reading-card')}>
          독서카드 보러가기 <span className="mgc_right_line"></span>
        </span>
      </div>
      <div className="horizontalScrollContainer">
        {readingCards.length > 0 ? (
          readingCards.map((card) => (
            <SingleReadingCard
              key={card.id}
              id={card.id}
              coverUrl={card.coverUrl}
              title={card.title}
              readingDate={card.readingDate}
              contentPreview={card.contentPreview}
            />
          ))
        ) : (
          <p className="noCardsMessage">등록된 독서 카드가 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default MyReadingCardSection;
