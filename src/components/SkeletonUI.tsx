import React from 'react';
import './SkeletonUI.css';

export const SkeletonCard: React.FC = () => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
    </div>
  </div>
);

export const SkeletonBookItem: React.FC = () => (
  <div className="skeleton-book-item">
    <div className="skeleton-book-cover"></div>
    <div className="skeleton-book-title"></div>
    <div className="skeleton-book-author"></div>
  </div>
);

export const SkeletonReadingCard: React.FC = () => (
  <div className="skeleton-reading-card">
    <div className="skeleton-card-image"></div>
    <div className="skeleton-card-content">
      <div className="skeleton-card-text"></div>
      <div className="skeleton-card-meta">
        <div className="skeleton-card-book-title"></div>
        <div className="skeleton-card-date"></div>
      </div>
    </div>
  </div>
);

export const SkeletonReadingCardGrid: React.FC = () => (
  <div className="skeleton-reading-card-grid">
    <div className="skeleton-grid-image"></div>
  </div>
);

export const SkeletonHeroSection: React.FC = () => (
  <div className="skeleton-library-hero">
    <div className="skeleton-library-hero-card skeleton-shimmer" />
    <div className="skeleton-library-hero-thumbs">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton-library-hero-thumb skeleton-shimmer" />
      ))}
    </div>
  </div>
);

export const SkeletonList: React.FC<{ count?: number; children: React.ReactNode }> = ({ 
  count = 3, 
  children 
}) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <React.Fragment key={index}>
        {children}
      </React.Fragment>
    ))}
  </>
); 