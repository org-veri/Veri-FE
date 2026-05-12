import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAllBooks, type Book, type GetAllBooksQueryParams } from '../../api/bookApi';

interface BookshelfItemType {
  id: string;
  coverUrl: string;
  title: string;
  author: string;
}

const SingleBookshelfItem: React.FC<BookshelfItemType> = ({ id, coverUrl, title, author }) => {
  const navigate = useNavigate();
  const fallbackImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="150"%3E%3Crect width="100" height="150" fill="%23E3E7ED"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Cover%3C/text%3E%3C/svg%3E';
  const hasErrorRef = React.useRef(false);

  const handleClick = () => {
    navigate(`/book-detail/${id}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasErrorRef.current && e.currentTarget.src !== fallbackImageUrl) {
      hasErrorRef.current = true;
      e.currentTarget.src = fallbackImageUrl;
    }
  };

  return (
    <div className="bookshelf-item" onClick={handleClick}>
      <div className="book-cover-thumbnail">
        <img
          src={coverUrl || fallbackImageUrl}
          alt={title}
          onError={handleImageError}
        />
      </div>
      <p className="book-title">{title}</p>
      <p className="book-author">{author}</p>
    </div>
  );
};

const MyBookshelfSection: React.FC = () => {
  const navigate = useNavigate();
  const [bookshelfItems, setBookshelfItems] = useState<BookshelfItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams: GetAllBooksQueryParams = {
          page: 1,
          size: 5,
        };
        
        const response = await getAllBooks(queryParams);

        if (response.isSuccess) {
          if (response.result && Array.isArray(response.result.memberBooks)) {
            const mappedBooks: BookshelfItemType[] = response.result.memberBooks.map((book: Book) => ({
              id: String(book.memberBookId),
              coverUrl: book.imageUrl,
              title: book.title,
              author: book.author,
            }));
            setBookshelfItems(mappedBooks.slice(0, 5));
          } else {
            console.warn("API는 성공을 반환했지만, 책 데이터(result.memberBooks)가 없거나 형식이 잘못되었습니다:", response);
            setBookshelfItems([]);
            setError("책장 데이터를 불러왔으나, 표시할 내용이 없습니다.");
          }
        } else {
          setError(response.message || "책장 데이터를 가져오는데 실패했습니다.");
        }
      } catch (err: any) {
        console.error('책장 데이터를 불러오는 중 오류 발생:', err);
        setError(`책장 데이터를 불러오는 데 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleGoToBookshelf = () => {
    navigate('/my-bookshelf');
  };

  if (isLoading) {
    return (
      <section className="my-bookshelf">
        <div className="section-header">
          <p>나의 책장</p>
          <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
        </div>
        <div className="bookshelf-list horizontal-scroll-container">
          <p className="loading-message">책장 데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="my-bookshelf">
        <div className="section-header">
          <p>나의 책장</p>
          <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
        </div>
        <div className="bookshelf-list horizontal-scroll-container">
          <p className="error-message">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-bookshelf">
      <div className="section-header">
        <p>나의 책장</p>
        <span className="more-link" onClick={handleGoToBookshelf}>책장으로 가기 &gt;</span>
      </div>
      <div className="bookshelf-list horizontal-scroll-container">
        {bookshelfItems.length > 0 ? (
          bookshelfItems.map((book) => (
            <SingleBookshelfItem
              key={book.id}
              id={book.id}
              coverUrl={book.coverUrl}
              title={book.title}
              author={book.author}
            />
          ))
        ) : (
          <p className="no-cards-message">등록된 책이 없습니다.</p>
        )}
      </div>
    </section>
  );
};

export default MyBookshelfSection;