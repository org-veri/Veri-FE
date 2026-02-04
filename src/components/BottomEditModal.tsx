import React, { useState } from 'react';
import './BottomEditModal.css';
import { updateBookStatus } from '../api/bookApi';
import starFillIcon from '../assets/icons/star_fill.svg';
import starLineIcon from '../assets/icons/star_line.svg';
import Toast from './Toast';

interface BottomEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberBookId: number;
  defaultScore: number;
  defaultStartedAt: string | null;
  defaultEndedAt: string | null;
  bookTitle: string;
  bookAuthor: string;
}

interface StarRatingInputProps {
  initialRating: number;
  onRatingChange: (rating: number) => void;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ initialRating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const handleClick = (index: number) => {
    setCurrentRating(index);
    onRatingChange(index);
  };

  return (
    <div className="star-rating-input">
      {[...Array(5)].map((_, index) => {
        index += 1; // 별점은 1부터 시작
        const isFilled = index <= (hoverRating || currentRating);
        return (
          <button
            type="button"
            key={index}
            className={`star-button ${isFilled ? "on" : "off"}`} // 클래스명 일관성 유지
            onClick={() => handleClick(index)}
            onMouseEnter={() => setHoverRating(index)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <img
              src={isFilled ? starFillIcon : starLineIcon}
              alt={isFilled ? "채워진 별" : "빈 별"}
              className="star-icon"
            />
          </button>
        );
      })}
    </div>
  );
};

const BottomEditModal: React.FC<BottomEditModalProps> = ({
  isOpen,
  onClose,
  memberBookId,
  defaultScore,
  defaultStartedAt,
  defaultEndedAt,
  bookTitle,
  bookAuthor,
}) => {
  const [score, setScore] = useState(defaultScore);
  const [startedAt, setStartedAt] = useState<string | null>(defaultStartedAt);
  const [endedAt, setEndedAt] = useState<string | null>(defaultEndedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning' | 'error'>('warning');

  const validateDates = (start: string | null, end: string | null) => {
    if (!start || !end) return true;
    
    const startDateStr = start.split('T')[0];
    const endDateStr = end.split('T')[0];
    
    if (!startDateStr || !endDateStr) return true;
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (endDate > today) {
      setToastMessage('종료일은 현재 날짜보다 과거이거나 오늘이어야 합니다.');
      setToastType('warning');
      setShowToast(true);
      return false;
    }

    if (endDate < startDate) {
      setToastMessage('종료일은 시작일보다 늦어야 합니다.');
      setToastType('warning');
      setShowToast(true);
      return false;
    }
    
    return true;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newStartDate = value ? new Date(value).toISOString() : null;
    setStartedAt(newStartDate);
    if (newStartDate && endedAt) {
      validateDates(newStartDate, endedAt);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newEndDate = value ? new Date(value).toISOString() : null;
    setEndedAt(newEndDate);
    if (startedAt && newEndDate) {
      validateDates(startedAt, newEndDate);
    }
  };

  const handleSave = async () => {
    if (!validateDates(startedAt, endedAt)) {
      return;
    }

    setIsSaving(true);
    try {
      await updateBookStatus(memberBookId, {
        score,
        startedAt: startedAt || null,
        endedAt: endedAt || null,
      });
      setToastMessage('책 정보가 성공적으로 수정되었습니다.');
      setToastType('success');
      setShowToast(true);
      onClose();
    } catch (error) {
      console.error('저장 중 오류가 발생했습니다:', error);
      setToastMessage('저장 중 오류가 발생했습니다.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bottom-edit-modal-overlay">
      <div className="bottom-edit-modal">
        <div className="modal-header">
          <p className="modal-title">{bookTitle}</p>
          <p className="modal-author">{bookAuthor}</p>
        </div>

        <div className="star-rating-container">
          <h3>나의 별점</h3>
          <StarRatingInput
            initialRating={score}
            onRatingChange={setScore}
          />
        </div>

        <div className="status-inputs-container">
          <h3>독서 기간</h3>
          <div className="date-inputs">
            <div className="start-time">
              <p>시작일</p>
              <input
                className='date-input'
                type="date"
                value={startedAt ? startedAt.split('T')[0] : ''}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="end-time">
              <p>종료일</p>
              <input
                className='date-input'
                type="date"
                value={endedAt ? endedAt.split('T')[0] : ''}
                max={new Date().toISOString().split('T')[0]} // 오늘 날짜까지만 선택 가능
                onChange={handleEndDateChange}
              />
            </div>
          </div>
        </div>

        <div className="edit-modal-button-container">
          <button onClick={onClose} className='cancel-button'>
            취소
          </button>
          <button onClick={handleSave} disabled={isSaving} className='complete-button'>
            {isSaving ? '저장 중...' : '완료'}
          </button>
        </div>
      </div>
      
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
};

export default BottomEditModal;