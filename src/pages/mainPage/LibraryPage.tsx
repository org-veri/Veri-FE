import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LibraryPage.css';
import starFillIcon from '../../assets/icons/star_fill.svg';
import starLineIcon from '../../assets/icons/star_line.svg';

import { getAllBooks, type Book, type GetAllBooksQueryParams } from '../../api/bookApi';
import BookshelfList from '../../components/LibraryPage/LibraryPageList';
import LibraryPageGrid from '../../components/LibraryPage/LibraryPageGrid';
import TopBar from '../../components/TopBar';
import { SkeletonList, SkeletonCard } from '../../components/SkeletonUI';
import ReadingStatusModal from '../../components/ReadingStatusModal';
import SortOptionsModal from '../../components/SortOptionsModal';


export const StarRatingFullPage: React.FC<{ rating: number }> = ({ rating }) => {
  // 별점 계산 로직 (기존과 동일)
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  const starElements = [];

  // 채워진 별
  for (let i = 0; i < fullStars; i++) {
    starElements.push(
      <img
        key={`full-${i}`}
        src={starFillIcon}
        alt="filled star"
        className="star full"
      />
    );
  }

  if (hasHalfStar) {
    starElements.push(
      <img
        key="half"
        src={starFillIcon}
        alt="half star"
        className="star half"
        style={{ clipPath: 'inset(0 50% 0 0)' }}
      />
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    starElements.push(
      <img
        key={`empty-${i}`}
        src={starLineIcon}
        alt="empty star"
        className="star empty"
      />
    );
  }

  return (
    <div className="star-rating-full-page">
      {starElements}
    </div>
  );
};

function LibraryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReadingStatuses, setSelectedReadingStatuses] = useState<string[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const sortButtonRef = useRef<HTMLSpanElement>(null);

  // fetchBooks 함수를 useCallback으로 감싸고, sortOrder가 변경될 때마다 재생성되도록 합니다.
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams: GetAllBooksQueryParams = {
        page: 1,
        size: 10,
        sort: sortOrder,
      };
      const response = await getAllBooks(queryParams);

      if (response.isSuccess) {
        setBooks(response.result.memberBooks);
        applyFilters(response.result.memberBooks, searchQuery, selectedReadingStatuses);
      } else {
        setError(response.message || "책 목록을 가져오는데 실패했습니다.");
      }
    } catch (err: any) {
      setError("책 목록을 불러오는 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sortOrder, searchQuery, selectedReadingStatuses]);

  // 필터링 함수 통합
  const applyFilters = useCallback((bookList: Book[], query: string, statusFilters: string[]) => {
    let filtered = bookList;

    // 텍스트 검색 필터
    if (query.trim()) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 독서 상태 필터 - 선택된 상태들만 표시
    if (statusFilters.length > 0) {
      filtered = filtered.filter(book => {
        // Book 타입의 status 속성 사용 (NOT_START, READING, DONE)
        return statusFilters.includes(book.status);
      });
    }

    // 정렬 적용 (클라이언트 사이드)
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === 'newest') {
        // 최신순: endedAt 또는 startedAt이 최근인 것부터
        const dateA = new Date(a.endedAt || a.startedAt || 0).getTime();
        const dateB = new Date(b.endedAt || b.startedAt || 0).getTime();
        return dateB - dateA;
      } else if (sortOrder === 'oldest') {
        // 오래된순: endedAt 또는 startedAt이 오래된 것부터
        const dateA = new Date(a.endedAt || a.startedAt || 0).getTime();
        const dateB = new Date(b.endedAt || b.startedAt || 0).getTime();
        return dateA - dateB;
      } else if (sortOrder === 'rating') {
        // 별점순: 높은 별점부터
        return b.score - a.score;
      }
      return 0;
    });

    setFilteredBooks(sorted);
  }, [sortOrder]);

  // 검색 필터링 함수
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    applyFilters(books, query, selectedReadingStatuses);
  }, [books, selectedReadingStatuses, applyFilters]);

  // 독서 상태 필터 변경
  const handleReadingStatusChange = useCallback((statuses: string[]) => {
    setSelectedReadingStatuses(statuses);
    applyFilters(books, searchQuery, statuses);
  }, [books, searchQuery, applyFilters]);

  // sortOrder 변경 시 필터 재적용
  useEffect(() => {
    if (books.length > 0) {
      applyFilters(books, searchQuery, selectedReadingStatuses);
    }
  }, [sortOrder, books, searchQuery, selectedReadingStatuses, applyFilters]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks, location.key]);

  const handleSortChange = useCallback((sort: 'newest' | 'oldest' | 'rating') => {
    setSortOrder(sort);
  }, []);

  const getSortDisplayText = (sort: 'newest' | 'oldest' | 'rating') => {
    switch (sort) {
      case 'newest': return '최신순';
      case 'oldest': return '오래된순';
      case 'rating': return '별점순';
      default: return '최신순';
    }
  };

  const handleCreateBookClick = useCallback(() => {
    navigate('/book-search');
  }, [navigate]);

  const handleProfileClick = () => navigate('/my-page');

  const handleViewModeToggle = useCallback((mode: 'list' | 'grid') => {
    setViewMode(mode);
  }, []);

  if (error) {
    return (
      <div className="loading-page-container">
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <TopBar onProfileClick={handleProfileClick} />

      <div className="header-margin"></div>

      <div className="library-content-wrapper">
        <div className="library-title-section">
          <h2 className="library-title">나의책장 <span className="book-count">{filteredBooks.length}</span></h2>
          <div className="view-toggle-buttons">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeToggle('list')}
              aria-label="리스트 보기"
            >
              <span className="mgc_rows_3_fill"></span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewModeToggle('grid')}
              aria-label="그리드 보기"
            >
              <span className="mgc_layout_grid_fill"></span>
            </button>
          </div>
        </div>

        <div className="filter-search-section">
          <div className="left-filters">
            <div className="reading-status-filters">
              <span
                ref={statusButtonRef}
                className={`sort-button ${selectedReadingStatuses.length > 0 ? 'active' : ''}`}
                onClick={() => setIsStatusModalOpen(!isStatusModalOpen)}
              >
                <div className="mgc_filter_fill"></div>
                독서상태
              </span>
            </div>
            <div className="sort-options">
              <span
                ref={sortButtonRef}
                className="sort-button"
                onClick={() => setIsSortModalOpen(!isSortModalOpen)}
              >
                <div className="mgc_filter_2_fill"></div>
                {getSortDisplayText(sortOrder)}
              </span>
            </div>
          </div>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="텍스트를 입력하세요"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="book-search-input"
            />
            <span className="mgc_search_2_fill"></span>
          </div>
        </div>

        {isLoading ? (
          <div className="books-container list-view">
            <SkeletonList count={5}>
              <SkeletonCard />
            </SkeletonList>
          </div>
        ) : filteredBooks.length === 0 && !error ? (
          <div className="no-books-message">
            {searchQuery ? (
              <p>검색 결과가 없습니다.</p>
            ) : selectedReadingStatuses.length > 0 ? (
              <p>선택한 독서상태의 책이 없습니다.</p>
            ) : (
              <p>등록된 책이 없습니다. 새로운 책을 등록해보세요!</p>
            )}
          </div>
        ) : (
          <div className={`books-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
            {viewMode === 'list' ? (
              <BookshelfList books={filteredBooks} />
            ) : (
              <LibraryPageGrid books={filteredBooks} />
            )}
          </div>
        )}
      </div>

      <div className='main-page-margin'>
      </div>

      <div className="create-button-container">
        <button className="create-button" onClick={handleCreateBookClick}>
          + 등록하기
        </button>
      </div>

      <ReadingStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        selectedStatuses={selectedReadingStatuses}
        onStatusChange={handleReadingStatusChange}
        buttonRef={statusButtonRef}
      />

      <SortOptionsModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        selectedSort={sortOrder}
        onSortChange={handleSortChange}
        buttonRef={sortButtonRef}
      />
    </div>
  );
}

export default LibraryPage;
