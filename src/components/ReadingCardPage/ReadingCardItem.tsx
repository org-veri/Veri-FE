import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadingCardItem.css';
import { type ReadingCardItemType } from '../../pages/mainPage/ReadingCardPage';
const ReadingCardItem: React.FC<ReadingCardItemType> = ({ id, title, contentPreview, date, thumbnailUrl, isPublic }) => {
    const navigate = useNavigate();
    const fallbackImageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="150"%3E%3Crect width="100" height="150" fill="%23E3E7ED"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
    const hasErrorRef = useRef(false);

    const handleClick = () => {
        navigate(`/reading-card-detail/${id}`);
    };

    const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\./g, '. ').trim();

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (!hasErrorRef.current && e.currentTarget.src !== fallbackImageUrl) {
            hasErrorRef.current = true;
            e.currentTarget.src = fallbackImageUrl;
        }
    };

    return (
        <div className="reading-card-page-item" onClick={handleClick}>
            <div className="card-image-container">
                <img
                    src={thumbnailUrl || fallbackImageUrl}
                    alt={title}
                    onError={handleImageError}
                />
                {!isPublic && (
                    <div className="private-badge-text">
                        <span className="mgc_unlock_fill"></span>
                    </div>
                )}
            </div>
            <div className="card-content">
                <p className="card-preview">{contentPreview}</p>
                <div className="card-book-info">
                    <p className="card-book-title">{title}</p>
                    <span className="card-date">{formattedDate}</span>
                </div>
            </div>
        </div>
    );
};

export default ReadingCardItem;
