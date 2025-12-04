import React from 'react';
import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  question: string;
  info: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  question,
  info
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-message-container">
          <p className="modal-question">{question}</p>
          <p className="modal-info">{info}</p>
        </div>
        <div className="modal-actions-delete">
          <button className="cancel-button" onClick={onClose} disabled={isLoading}>
            취소하기
          </button>
          <button className="delete-button" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '삭제 중...' : '삭제하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

