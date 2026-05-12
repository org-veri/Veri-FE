import React, { useState, useRef, useEffect } from 'react';
import './CommunityPostEditModal.css';
import { updatePost } from '../api/communityApi';
import { uploadImageAndGetUrl } from '../api/cardApi';
import { FiUpload, FiX, FiTrash2 } from 'react-icons/fi';

interface CommunityPostEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: number;
    defaultTitle?: string; // Optional if not all posts have titles or we don't display it
    defaultContent: string;
    defaultImages: string[];
    bookTitle?: string;
    bookAuthor?: string;
    onUpdateSuccess: () => void;
}

const CommunityPostEditModal: React.FC<CommunityPostEditModalProps> = ({
    isOpen,
    onClose,
    postId,
    defaultTitle = '',
    defaultContent,
    defaultImages,
    bookTitle,
    bookAuthor,
    onUpdateSuccess,
}) => {
    const [content, setContent] = useState(defaultContent);
    const [title, setTitle] = useState(defaultTitle);
    const [images, setImages] = useState<string[]>(defaultImages);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setContent(defaultContent);
            setTitle(defaultTitle);
            setImages(defaultImages);
        }
    }, [isOpen, defaultContent, defaultTitle, defaultImages]);

    const handleImageUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const uploadedUrl = await uploadImageAndGetUrl(file);
            setImages(prev => [...prev, uploadedUrl]);
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
        // Reset input value to allow selecting the same file again if needed
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!content.trim()) {
            alert('게시글 내용을 입력해주세요.');
            return;
        }

        /* 
           Note: API requires title. If we don't expose title editing for some reason, 
           we should ensure it's passed or send a default. 
           Here we assume user can edit it or it defaults to existing title.
           If empty, we might need to alert or provide placeholder.
        */
        if (!title.trim()) {
            // If the original post had a title, we should probably keep it or require it.
            // For now, let's require it if it's exposed.
            alert('제목을 입력해주세요.');
            return;
        }

        setIsSaving(true);
        try {
            await updatePost(postId, {
                title: title.trim(),
                content: content.trim(),
                images: images,
            });
            alert('게시글이 성공적으로 수정되었습니다.');
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
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="community-post-edit-modal-overlay">
            <div className="community-post-edit-modal">
                <div className="modal-header">
                    {bookTitle ? (
                        <>
                            <p className="modal-title">{bookTitle}</p>
                            <p className="modal-author">{bookAuthor}</p>
                        </>
                    ) : (
                        <p className="modal-title">게시글 수정</p>
                    )}
                    <button className="close-button" onClick={handleClose} disabled={isSaving || isUploading}>
                        <FiX size={20} />
                    </button>
                </div>

                {/* Title Input (Assuming we want to allow title editing) */}
                <div className="input-container">
                    <h3>제목</h3>
                    <input
                        className="text-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        maxLength={100}
                    />
                </div>

                <div className="input-container">
                    <h3>이미지 ({images.length})</h3>
                    <div className="image-preview-wrapper">
                        {images.length > 0 && (
                            <div className="image-list">
                                {images.map((imgUrl, index) => (
                                    <div key={index} className="image-item-container">
                                        <img src={imgUrl} alt={`Preview ${index}`} className="image-preview" />
                                        <button className="remove-image-button" onClick={() => handleRemoveImage(index)}>
                                            <FiTrash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            className="upload-button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <FiUpload size={16} />
                            <span>{isUploading ? '업로드 중...' : '이미지 추가'}</span>
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

                <div className="input-container">
                    <h3>내용</h3>
                    <textarea
                        className="content-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="게시글 내용을 입력하세요..."
                        rows={6}
                        maxLength={1000}
                    />
                    <div className="character-count">
                        {content.length}/1000
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

export default CommunityPostEditModal;
