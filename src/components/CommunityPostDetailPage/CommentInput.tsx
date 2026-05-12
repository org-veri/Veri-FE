import React from 'react';
import './CommentInput.css';

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

function CommentInput({
  value,
  onChange,
  onSubmit,
  isSubmitting
}: CommentInputProps) {
  return (
    <div className="comment-input-section">
      <form onSubmit={onSubmit} className="comment-form">
        <div className="comment-input-wrapper">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="댓글을 입력해 주세요"
            className="comment-input"
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            className="comment-submit"
            disabled={isSubmitting || !value.trim()}
          >
            {isSubmitting ? (
              <span>...</span>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommentInput;

