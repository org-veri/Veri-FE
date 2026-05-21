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

export const SkeletonHomeReadingCard: React.FC = () => (
  <div className="skeleton-home-reading-card">
    <div className="skeleton-home-reading-card-thumb skeleton-shimmer" />
    <div className="skeleton-home-reading-card-text skeleton-shimmer" />
  </div>
);

export const SkeletonFriendsCard: React.FC = () => (
  <div className="skeleton-friends-card">
    <div className="skeleton-friends-card-thumb skeleton-shimmer" />
    <div className="skeleton-friends-card-line skeleton-shimmer" />
    <div className="skeleton-friends-card-line skeleton-friends-card-line--short skeleton-shimmer" />
  </div>
);

export const SkeletonCommunityPost: React.FC = () => (
  <div className="skeleton-community-post">
    <div className="skeleton-community-post-header">
      <div className="skeleton-community-post-avatar skeleton-shimmer" />
      <div className="skeleton-community-post-author">
        <div className="skeleton-community-post-name skeleton-shimmer" />
        <div className="skeleton-community-post-book skeleton-shimmer" />
      </div>
    </div>
    <div className="skeleton-community-post-image skeleton-shimmer" />
    <div className="skeleton-community-post-footer">
      <div className="skeleton-community-post-stats skeleton-shimmer" />
      <div className="skeleton-community-post-caption skeleton-shimmer" />
    </div>
  </div>
);

export const SkeletonHorizontalRow: React.FC<{ count?: number; children: React.ReactNode }> = ({
  count = 4,
  children,
}) => (
  <div className="skeleton-horizontal-row">
    {Array.from({ length: count }, (_, index) => (
      <React.Fragment key={index}>{children}</React.Fragment>
    ))}
  </div>
);

export const SkeletonCommunityCardsGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="skeleton-community-cards-grid">
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="skeleton-community-card-grid-item skeleton-shimmer" />
    ))}
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