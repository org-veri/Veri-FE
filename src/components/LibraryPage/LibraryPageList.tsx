import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LibraryPageList.css';

import { StarRatingFullPage } from '../../pages/mainPage/LibraryPage';
import { type Book, type BookStatus } from '../../api/bookApi';

interface BookshelfListProps {
  books: Book[];
}

const BookshelfList: React.FC<BookshelfListProps> = ({ books }) => {
  const navigate = useNavigate();

  const handleBookClick = (bookId: number) => {
    navigate(`/book-detail/${bookId}`);
  };

  const getStatusClass = (status: BookStatus) => {
    switch (status) {
      case 'READING':
        return '독서중';
      case 'DONE':
        return '완독';
      case 'NOT_START':
        return '읽기전';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className="bookshelf-list-full">
      {books.length > 0 ? (
        books.map((book) => (
          <div
            key={book.memberBookId}
            className="bookshelf-item-full"
            onClick={() => handleBookClick(book.memberBookId)}
            role="button"
            tabIndex={0}
          >
            <div className="book-cover-large">
              <img
                src={book.imageUrl || 'https://via.placeholder.com/80x120?text=No+Cover'}
                alt={book.title}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/80x120?text=No+Cover";
                }}
              />
            </div>
            <div className="book-details-full">
              <div className="book-top-info">
                <h4 className="book-title-full">{book.title}</h4>
                <p className="book-author-full">{book.author}</p>
                <StarRatingFullPage rating={book.score} />
              </div>
              <div className="book-status-info">
                <span className={`book-status ${getStatusClass(book.status)}`}>
                  {book.status === 'READING'
                    ? '독서중'
                    : book.status === 'DONE'
                      ? '완독'
                      : book.status === 'NOT_START'
                        ? '읽기 전'
                        : book.status}
                </span>
                <span className="book-date">
                  {book.startedAt ? new Date(book.startedAt).toLocaleDateString('ko-KR') : ''}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="no-books-message">책장에 등록된 책이 없습니다.</p>
      )}
    </div>
  );
};

export default BookshelfList;