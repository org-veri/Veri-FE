import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardPage.css';
import ReadingCardItem from '../../components/ReadingCardPage/ReadingCardItem';
import ReadingCardGridItem from '../../components/ReadingCardPage/ReadingCardGridItem';
import { getMyCards, getCardDetailById, type MyCardItem, type GetMyCardsQueryParams } from '../../api/cardApi';
import TopBar from '../../components/TopBar';
import { SkeletonList, SkeletonReadingCard, SkeletonReadingCardGrid } from '../../components/SkeletonUI';

export interface ReadingCardItemType {
    id: string;
    title: string | undefined;
    contentPreview: string;
    date: string;
    thumbnailUrl: string;
    isPublic: boolean;
}

function ReadingCardPage() {
    const navigate = useNavigate();
    const [readingCards, setReadingCards] = useState<ReadingCardItemType[]>([]);
    const [filteredCards, setFilteredCards] = useState<ReadingCardItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredCards(readingCards);
        } else {
            const filtered = readingCards.filter(card =>
                (card.title && card.title.toLowerCase().includes(query.toLowerCase())) ||
                card.contentPreview.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredCards(filtered);
        }
    }, [readingCards]);

    const fetchCards = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const queryParams: GetMyCardsQueryParams = {
                page: 1,
                size: 20,
                sort: sortOrder,
            };
            
            const response = await getMyCards(queryParams);

            if (response.isSuccess && response.result?.cards) {
                const basicCards = response.result.cards.map((card: MyCardItem) => ({
                    id: card.cardId ? String(card.cardId) : `temp-${Date.now()}-${Math.random()}`,
                    title: card.content.length > 30 ? `${card.content.substring(0, 30)}...` : card.content || "제목 없음",
                    contentPreview: card.content.length > 100 ? `${card.content.substring(0, 100)}...` : card.content,
                    date: card.created,
                    thumbnailUrl: card.image,
                    isPublic: card.isPublic,
                }));
                
                setReadingCards(basicCards);
                setFilteredCards(basicCards);
                setIsLoading(false);

                const cardDetailPromises = response.result.cards
                    .filter(card => card.cardId)
                    .map(async (card: MyCardItem, index: number) => {
                        try {
                            const detailResponse = await getCardDetailById(card.cardId!);
                            if (detailResponse.isSuccess && detailResponse.result?.book?.title) {
                                return {
                                    index,
                                    cardId: card.cardId!,
                                    bookTitle: detailResponse.result.book.title
                                };
                            }
                        } catch (detailErr) {
                            console.error(`카드 상세 정보 가져오기 실패 (ID: ${card.cardId}):`, detailErr);
                        }
                        return null;
                    });

                const detailResults = await Promise.allSettled(cardDetailPromises);
                setReadingCards(prevCards => {
                    const updatedCards = [...prevCards];
                    detailResults.forEach((result) => {
                        if (result.status === 'fulfilled' && result.value) {
                            const detail = result.value;
                            const cardIndex = response.result.cards.findIndex(card => card.cardId === detail.cardId);
                            if (cardIndex !== -1 && updatedCards[cardIndex]) {
                                updatedCards[cardIndex] = {
                                    ...updatedCards[cardIndex],
                                    title: detail.bookTitle
                                };
                            }
                        }
                    });
                    return updatedCards;
                });
            } else {
                setReadingCards([]);
                setFilteredCards([]);
                if (!response.result?.cards || response.result.cards.length === 0) {
                } else {
                    setError("독서 카드를 불러왔으나, 표시할 내용이 없습니다.");
                }
            }
        } catch (err: any) {
            console.error('독서 카드 데이터 로딩 오류:', err);
            setError(`독서 카드를 불러오는 데 실패했습니다: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [sortOrder]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [readingCards, searchQuery, handleSearch]);

    // 이벤트 핸들러들
    const handleSortClick = useCallback(() => {
        setSortOrder(prevOrder => prevOrder === 'newest' ? 'oldest' : 'newest');
    }, []);

    const handleTabClick = useCallback((tab: 'image' | 'text') => {
        setActiveTab(tab);
    }, []);

    const handleCreateCardClick = () => {
        navigate('/make-card');
    };

    const handleSearchClick = () => {
        navigate('/book-search');
    };

    const handleProfileClick = () => {
        navigate('/my-page');
    };

    if (error) {
        return <div className="loading-page-container reading-card-page-message reading-card-page-error">{error}</div>;
    }

    return (
        <div className="page-container">
            <div className="reading-card-hero-section">
                <TopBar 
                    onSearchClick={handleSearchClick}
                    onProfileClick={handleProfileClick}
                />
                
                <div className="header-margin" />
                
                <nav className="tab-navigation">
                    <button
                        className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
                        onClick={() => handleTabClick('image')}
                    >
                        이미지
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
                        onClick={() => handleTabClick('text')}
                    >
                        텍스트
                    </button>
                </nav>
                
                {activeTab === 'text' && (
                    <div className="reading-card-search-input-container">
                        <input
                            type="text"
                            placeholder="텍스트를 입력하세요"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="card-search-input"
                        />
                        <span className="mgc_search_2_fill"></span>
                    </div>
                )}

                <div className="sort-options">
                    <span 
                        className="sort-button" 
                        onClick={handleSortClick}
                    >
                        {sortOrder === 'newest' ? '최신순' : '오래된순'}
                        <span className={sortOrder === 'newest' ? 'mgc_down_fill' : 'mgc_up_fill'}></span>
                    </span>
                </div>

                {activeTab === 'image' && (
                    <div className="reading-card-grid-view">
                        {isLoading ? (
                            <SkeletonList count={8}>
                                <SkeletonReadingCardGrid />
                            </SkeletonList>
                        ) : filteredCards.length > 0 ? (
                            filteredCards.map((card) => (
                                <ReadingCardGridItem
                                    key={card.id}
                                    id={card.id}
                                    title={card.title}
                                    contentPreview={card.contentPreview}
                                    date={card.date}
                                    thumbnailUrl={card.thumbnailUrl}
                                    isPublic={card.isPublic}
                                />
                            ))
                        ) : (
                            <p className="no-cards-message">등록된 독서 카드가 없습니다.</p>
                        )}
                    </div>
                )}

                {activeTab === 'text' && (
                    <div className="reading-card-text-view">
                        {isLoading ? (
                            <SkeletonList count={5}>
                                <SkeletonReadingCard />
                            </SkeletonList>
                        ) : filteredCards.length > 0 ? (
                            filteredCards.map((card) => (
                                <ReadingCardItem
                                    key={card.id}
                                    id={card.id}
                                    title={card.title}
                                    contentPreview={card.contentPreview}
                                    date={card.date}
                                    thumbnailUrl={card.thumbnailUrl}
                                    isPublic={card.isPublic}
                                />
                            ))
                        ) : (
                            <p className="no-cards-message">
                                {searchQuery ? "검색 결과가 없습니다." : "등록된 독서 카드가 없습니다."}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className='main-page-margin'>
            </div>
            
            <div className="create-button-container">
                <button className="create-button" onClick={handleCreateCardClick}>
                    + 등록하기
                </button>
            </div>
        </div>
    );
}

export default ReadingCardPage;
