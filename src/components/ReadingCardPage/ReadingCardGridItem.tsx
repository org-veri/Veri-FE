import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardGridItem.css';
import { type ReadingCardItemType } from '../../pages/mainPage/ReadingCardPage';
const ReadingCardGridItem: React.FC<ReadingCardItemType> = ({ id, title, thumbnailUrl, isPublic }) => {
    const navigate = useNavigate();
    const fallbackImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="200"%3E%3Crect width="150" height="200" fill="%23E3E7ED"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
    const hasErrorRef = useRef(false);

    // 클릭 시 독서 카드 상세 페이지로 이동
    const handleClick = () => {
        navigate(`/reading-card-detail/${id}`);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (!hasErrorRef.current && e.currentTarget.src !== fallbackImageUrl) {
            hasErrorRef.current = true;
            e.currentTarget.src = fallbackImageUrl;
        }
    };

    return (
        <div className="reading-card-grid-item" onClick={handleClick}>
            <div className="grid-image-wrapper">
                <img
                    src={thumbnailUrl || fallbackImageUrl}
                    alt={title}
                    onError={handleImageError}
                />
                {!isPublic && (
                    <div className="private-badge">
                        <span className="mgc_lock_fill"></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadingCardGridItem;
