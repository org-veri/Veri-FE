import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { getPopularBooks, type PopularBookItem, type GetPopularBooksQueryParams } from '../../api/bookApi';

interface RecommendedBookType {
  title: string;
  imageUrl: string;
  author: string;
  publisher: string;
  isbn: string;
}

const SingleRecommendedBookItem: React.FC<RecommendedBookType> = ({ title, imageUrl, author, publisher, isbn }) => {
  const navigate = useNavigate();
  const fallbackImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="120"%3E%3Crect width="80" height="120" fill="%23E3E7ED"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3ENo Cover%3C/text%3E%3C/svg%3E';
  const hasErrorRef = React.useRef(false);

  const handleClick = () => {
    navigate('/book-add', {
      state: {
        bookInfo: {
          title,
          imageUrl,
          author,
          publisher,
          isbn,
        }
      }
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasErrorRef.current && e.currentTarget.src !== fallbackImageUrl) {
      hasErrorRef.current = true;
      e.currentTarget.src = fallbackImageUrl;
    }
  };

  return (
    <div className="recommended-book-item" onClick={handleClick}>
      <div className="recommended-book-item-cover-thumbnail">
        <img
          src={imageUrl || fallbackImageUrl}
          alt={title}
          onError={handleImageError}
        />
      </div>
      <p className="book-item-title">{title}</p>
      <p className="book-item-author">{author}</p>
    </div>
  );
};

const TodaysRecommendationSection: React.FC = () => {
  const [recommendedBooks, setRecommendedBooks] = useState<RecommendedBookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams: GetPopularBooksQueryParams = {
          page: 1,
          size: 5,
        };
        const response = await getPopularBooks(queryParams);

        if (response.isSuccess && response.result && response.result.books) {
          const mappedBooks: RecommendedBookType[] = response.result.books.map((book: PopularBookItem) => ({
            title: book.title,
            imageUrl: book.image,
            author: book.author,
            publisher: book.publisher,
            isbn: book.isbn,
          }));
          setRecommendedBooks(mappedBooks);
        } else {
          setError(response.message || "오늘의 추천 도서를 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('추천 도서 데이터를 불러오는 중 오류 발생:', err);
        setError(`추천 도서를 불러오는 데 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (isLoading) {
    return (
      <section className="todays-recommendation">
        <div className="recommendation-section-header">
          <p>오늘의 추천</p>
          <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
        </div>
        <div 
          className="recommendation-list horizontal-scroll-container"
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <p className="loading-message">오늘의 추천 데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="todays-recommendation">
        <div className="recommendation-section-header">
          <p>오늘의 추천</p>
          <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
        </div>
        <div 
          className="recommendation-list horizontal-scroll-container"
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <p className="error-message">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="todays-recommendation">
      <div className="recommendation-section-header">
        <p>오늘의 추천</p>
        <span className="more-text">오늘 가장 많이 읽은 책이에요</span>
      </div>
      <div 
        className="recommendation-list horizontal-scroll-container"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {recommendedBooks.length > 0 ? (
          recommendedBooks.map((book) => (
            <SingleRecommendedBookItem
              key={book.isbn}
              title={book.title}
              imageUrl={book.imageUrl}
              author={book.author}
              publisher={book.publisher}
              isbn={book.isbn}
            />
          ))
        ) : (
          <p className="no-cards-message">추천 도서가 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default TodaysRecommendationSection;