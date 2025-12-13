// src/pages/bookmarkPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew, MdBookmark, MdBookmarkBorder } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import './bookmarkPage.css';
import type { Bookmark } from '../api/bookmarkApi';
import { getBookmarks } from '../api/bookmarkApi';

function BookmarkPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'oldest'>('all');

  useEffect(() => {
    let isMounted = true;

    const fetchBookmarks = async () => {
      try {
        setIsLoading(true);
        const response = await getBookmarks();
        if (!response.isSuccess || !Array.isArray(response.result)) {
          throw new Error(response.message || '북마크 데이터를 불러오지 못했습니다.');
        }

        if (isMounted) {
          setBookmarks(response.result);
          setFilteredBookmarks(response.result);
        }
      } catch (error) {
        console.error('북마크 데이터를 불러오는 중 오류 발생:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookmarks();

    return () => {
      isMounted = false;
    };
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = bookmarks.filter(bookmark =>
      bookmark.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.bookAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬 필터 적용
    switch (activeFilter) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        // 기본 정렬 (최신순)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchTerm, activeFilter]);

  const handleBookmarkToggle = (bookmarkId: number) => {
    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === bookmarkId 
          ? { ...bookmark, isBookmarked: !bookmark.isBookmarked }
          : bookmark
      )
    );
  };

  const handleBookClick = (bookId: number) => {
    navigate(`/book-detail/${bookId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleFilterChange = (filter: 'all' | 'recent' | 'oldest') => {
    setActiveFilter(filter);
  };

  if (isLoading) {
    return (
      <div className="bookmark-page-container">
        <div className="loading-container">
          <p>북마크를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmark-page-container">
      {/* 헤더 */}
      <header className="bookmark-header">
        <button className="header-back-button" onClick={() => navigate(-1)}>
          <MdArrowBackIosNew size={24} color="#333" />
        </button>
        <h1 className="header-title">북마크</h1>
        <div className="header-placeholder"></div>
      </header>

      {/* 검색 및 필터 섹션 */}
      <div className="search-filter-section">
        <div className="search-container">
          <FiSearch className="search-icon" size={20} />
          <input
            type="text"
            placeholder="책 제목, 저자, 메모로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <button
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            전체
          </button>
          <button
            className={`filter-button ${activeFilter === 'recent' ? 'active' : ''}`}
            onClick={() => handleFilterChange('recent')}
          >
            최신순
          </button>
          <button
            className={`filter-button ${activeFilter === 'oldest' ? 'active' : ''}`}
            onClick={() => handleFilterChange('oldest')}
          >
            오래된순
          </button>
        </div>
      </div>

      {/* 북마크 목록 */}
      <div className="bookmarks-content">
        {filteredBookmarks.length === 0 ? (
          <div className="empty-state">
            <MdBookmarkBorder size={64} color="#ccc" />
            <h3>저장된 북마크가 없습니다</h3>
            <p>책을 읽으면서 중요한 부분에 북마크를 추가해보세요.</p>
            <button 
              className="browse-books-button"
              onClick={() => navigate('/library')}
            >
              책장으로 가기
            </button>
          </div>
        ) : (
          <div className="bookmarks-list">
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bookmark-item">
                <div className="bookmark-content" onClick={() => handleBookClick(bookmark.bookId)}>
                  <div className="book-cover">
                    <img
                      src={bookmark.bookCoverUrl}
                      alt={bookmark.bookTitle}
                      className="book-cover-image"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/100x150?text=No+Image";
                      }}
                    />
                  </div>
                  
                  <div className="bookmark-info">
                    <h3 className="book-title">{bookmark.bookTitle}</h3>
                    <p className="book-author">{bookmark.bookAuthor}</p>
                    {bookmark.pageNumber && (
                      <p className="page-number">{bookmark.pageNumber}페이지</p>
                    )}
                    {bookmark.note && (
                      <p className="bookmark-note">{bookmark.note}</p>
                    )}
                    <p className="bookmark-date">{formatDate(bookmark.createdAt)}</p>
                  </div>
                </div>
                
                <button
                  className="bookmark-toggle-button"
                  onClick={() => handleBookmarkToggle(bookmark.id)}
                >
                  {bookmark.isBookmarked ? (
                    <MdBookmark size={24} color="#0CE19A" />
                  ) : (
                    <MdBookmarkBorder size={24} color="#ccc" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookmarkPage;
