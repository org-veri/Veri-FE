import React, { useEffect, useRef } from 'react';
import './SortOptionsModal.css';

interface SortOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSort: 'newest' | 'oldest' | 'rating';
  onSortChange: (sort: 'newest' | 'oldest' | 'rating') => void;
  buttonRef: React.RefObject<HTMLSpanElement | null>;
}

const SortOptionsModal: React.FC<SortOptionsModalProps> = ({
  isOpen,
  onClose,
  selectedSort,
  onSortChange,
  buttonRef
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current && modalRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const modal = modalRef.current;
      
      modal.style.top = `${buttonRect.bottom + 8}px`;
      modal.style.left = `${buttonRect.left}px`;
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  const handleSortSelect = (sort: 'newest' | 'oldest' | 'rating') => {
    onSortChange(sort);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="sort-options-modal" ref={modalRef}>
        <div 
          className={`sort-option ${selectedSort === 'newest' ? 'selected' : ''}`}
          onClick={() => handleSortSelect('newest')}
        >
          <span className="sort-text">최신순</span>
        </div>
        <div className="sort-divider"></div>
        <div 
          className={`sort-option ${selectedSort === 'oldest' ? 'selected' : ''}`}
          onClick={() => handleSortSelect('oldest')}
        >
          <span className="sort-text">오래된순</span>
        </div>
        <div className="sort-divider"></div>
        <div 
          className={`sort-option ${selectedSort === 'rating' ? 'selected' : ''}`}
          onClick={() => handleSortSelect('rating')}
        >
          <span className="sort-text">별점순</span>
        </div>
    </div>
  );
};

export default SortOptionsModal; 