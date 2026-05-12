import React, { useState, useRef } from 'react';
import './ReadingCardEditModal.css';
import { updateCard, uploadImageAndGetUrl } from '../api/cardApi';
import { FiUpload, FiX } from 'react-icons/fi';

interface ReadingCardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: number;
  defaultContent: string;
  defaultImageUrl: string;
  bookTitle: string;
  bookAuthor: string;
  onUpdateSuccess: () => void;
}

const ReadingCardEditModal: React.FC<ReadingCardEditModalProps> = ({
  isOpen,
  onClose,
  cardId,
  defaultContent,
  defaultImageUrl,
  bookTitle,
  bookAuthor,
  onUpdateSuccess,
}) => {
  const [content, setContent] = useState(defaultContent);
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageAndGetUrl(file);
      setImageUrl(uploadedUrl);
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      alert('카드 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await updateCard(cardId, {
        content: content.trim(),
        imageUrl: imageUrl,
      });
      alert('독서 카드가 성공적으로 수정되었습니다.');
      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error('저장 중 오류가 발생했습니다:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && !isUploading) {
      setContent(defaultContent);
      setImageUrl(defaultImageUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reading-card-edit-modal-overlay">
      <div className="reading-card-edit-modal">
        <div className="modal-header">
          <p className="modal-title">{bookTitle}</p>
          <p className="modal-author">{bookAuthor}</p>
          <button className="close-button" onClick={handleClose} disabled={isSaving || isUploading}>
            <FiX size={20} />
          </button>
        </div>

        <div className="image-upload-container">
          <h3>카드 이미지</h3>
          <div className="image-preview-wrapper">
            <img
              src={imageUrl || 'https://placehold.co/300x400?text=No+Image'}
              alt="카드 이미지 미리보기"
              className="image-preview"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/300x400?text=No+Image";
              }}
            />
            <button
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <FiUpload size={16} />
              <span>{isUploading ? '업로드 중...' : '이미지 변경'}</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        <div className="content-input-container">
          <h3>카드 내용</h3>
          <textarea
            className="content-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="독서 카드 내용을 입력하세요..."
            rows={6}
            maxLength={500}
          />
          <div className="character-count">
            {content.length}/500
          </div>
        </div>

        <div className="edit-modal-button-container">
          <button onClick={handleClose} className='cancel-button' disabled={isSaving || isUploading}>
            취소
          </button>
          <button onClick={handleSave} disabled={isSaving || isUploading} className='complete-button'>
            {isSaving ? '저장 중...' : '완료'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingCardEditModal;
