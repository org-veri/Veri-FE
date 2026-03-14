import React, { useEffect, useRef } from 'react';
import './ReadingStatusModal.css';

interface ReadingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  buttonRef: React.RefObject<HTMLElement | null>;
}

const ReadingStatusModal: React.FC<ReadingStatusModalProps> = ({
  isOpen,
  onClose,
  selectedStatus,
  onStatusChange,
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

  // 단일 선택: 같은 항목 클릭 시 해제, 다른 항목 클릭 시 해당 항목만 선택
  const handleStatusSelect = (status: string) => {
    onStatusChange(selectedStatus === status ? null : status);
  };

  if (!isOpen) return null;

  return (
    <div className="reading-status-modal" ref={modalRef}>
        <div className="status-option">
          <label
            className="checkbox-label"
            onClick={(e) => {
              e.preventDefault();
              handleStatusSelect('READING');
            }}
          >
            <input
              type="radio"
              name="reading-status"
              checked={selectedStatus === 'READING'}
              onChange={() => handleStatusSelect('READING')}
              className="hidden-checkbox"
            />
            <div className="custom-checkbox">
              {selectedStatus === 'READING' && <span className="checkmark">✓</span>}
            </div>
            <span className={`status-text ${selectedStatus === 'READING' ? 'selected' : ''}`}>독서중</span>
          </label>
        </div>
        <div className="status-divider"></div>
        <div className="status-option">
          <label
            className="checkbox-label"
            onClick={(e) => {
              e.preventDefault();
              handleStatusSelect('DONE');
            }}
          >
            <input
              type="radio"
              name="reading-status"
              checked={selectedStatus === 'DONE'}
              onChange={() => handleStatusSelect('DONE')}
              className="hidden-checkbox"
            />
            <div className="custom-checkbox">
              {selectedStatus === 'DONE' && <span className="checkmark">✓</span>}
            </div>
            <span className={`status-text ${selectedStatus === 'DONE' ? 'selected' : ''}`}>독서완료</span>
          </label>
        </div>
    </div>
  );
};

export default ReadingStatusModal; 