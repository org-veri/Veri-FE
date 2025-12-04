// src/components/CommunityPostDetailPage/PostActionToggle.tsx
import React from 'react';
import './PostActionToggle.css';

interface PostActionToggleProps {
  type: 'like' | 'comment';
  count: number;
  isActive?: boolean;
  isOpen?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function PostActionToggle({
  type,
  count,
  isActive = false,
  isOpen = false,
  onClick,
  disabled = false
}: PostActionToggleProps) {
  const iconClass = type === 'like' 
    ? (isActive ? 'mgc_heart_fill' : 'mgc_heart_line')
    : 'mgc_chat_3_line';
  
  const arrowClass = isOpen ? 'mgc_up_fill' : 'mgc_down_fill';

  return (
    <button
      className={`post-action-toggle ${type} ${isActive ? 'active' : ''} ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={iconClass}></span>
      <span className="action-count">{count}</span>
      <span className={arrowClass}></span>
    </button>
  );
}

export default PostActionToggle;

