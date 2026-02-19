import React, { useEffect, useRef } from 'react';
import './ReadingStatusModal.css';

interface ReadingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const ReadingStatusModal: React.FC<ReadingStatusModalProps> = ({
  isOpen,
  onClose,
  selectedStatuses,
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

  const handleStatusToggle = (status: string) => {
    let newStatuses;
    if (selectedStatuses.includes(status)) {
      newStatuses = selectedStatuses.filter(s => s !== status);
    } else {
      newStatuses = [...selectedStatuses, status];
    }
    onStatusChange(newStatuses);
  };

  if (!isOpen) return null;

  return (
    <div className="reading-status-modal" ref={modalRef}>
        <div className="status-option">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedStatuses.includes('READING')}
              onChange={() => handleStatusToggle('READING')}
              className="hidden-checkbox"
            />
            <div className="custom-checkbox">
              {selectedStatuses.includes('READING') && <span className="checkmark">✓</span>}
            </div>
            <span className={`status-text ${selectedStatuses.includes('READING') ? 'selected' : ''}`}>독서중</span>
          </label>
        </div>
        <div className="status-divider"></div>
        <div className="status-option">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedStatuses.includes('DONE')}
              onChange={() => handleStatusToggle('DONE')}
              className="hidden-checkbox"
            />
            <div className="custom-checkbox">
              {selectedStatuses.includes('DONE') && <span className="checkmark">✓</span>}
            </div>
            <span className={`status-text ${selectedStatuses.includes('DONE') ? 'selected' : ''}`}>독서완료</span>
          </label>
        </div>
    </div>
  );
};

export default ReadingStatusModal; 