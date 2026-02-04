import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WritePostPage.css';
import type { BookItem } from '../../api/bookSearchApi';
import { createPost } from '../../api/communityApi';
import { uploadImage } from '../../api/imageApi';
import Toast from '../../components/Toast';

interface SelectedBookInfo extends BookItem {
  bookId?: number;
}

function WritePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [selectedBook, setSelectedBook] = useState<SelectedBookInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const restoreDraft = async () => {
      try {
        if (location.state?.selectedBook) {
          setSelectedBook(location.state.selectedBook);
        }
        
        const savedData = localStorage.getItem('writePostDraft');
        if (savedData) {
          const draft = JSON.parse(savedData);
          
          setTitle(draft.title || '');
          setContent(draft.content || '');
          
          if (!location.state?.selectedBook && draft.selectedBook) {
            setSelectedBook(draft.selectedBook);
          }
          
          if (draft.images && draft.images.length > 0) {
            setImages(draft.images);
            
            if (draft.uploadedImageUrls && draft.uploadedImageUrls.length > 0) {
              setUploadedImageUrls(draft.uploadedImageUrls);
            } else {
              setUploadedImageUrls([]);
            }
          }
        }
        
        setIsInitialLoad(false);
      } catch (error) {
        console.error('데이터 복원 실패:', error);
        setIsInitialLoad(false);
      }
    };
    
    restoreDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!isInitialLoad) {
      try {
        const draft = {
          title,
          content,
          images,
          uploadedImageUrls,
          selectedBook
        };
        localStorage.setItem('writePostDraft', JSON.stringify(draft));
      } catch (error) {
        console.error('임시 저장 실패:', error);
      }
    }
  }, [title, content, images, uploadedImageUrls, selectedBook, isInitialLoad]);

  const handleBookSelection = () => {
    navigate('/post-book-search');
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxImages = 10;
    const filesToProcess = Array.from(files).slice(0, maxImages - images.length);

    if (filesToProcess.length === 0) {
      showToast('최대 10개까지 이미지를 업로드할 수 있습니다.', 'warning');
      return;
    }

    setIsUploadingImages(true);

    const newImages: string[] = [];
    const newUploadedUrls: string[] = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        continue;
      }
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;
      newImages.push(base64);

      // 즉시 업로드
      try {
        const uploadedUrl = await uploadImage(file);
        newUploadedUrls.push(uploadedUrl);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        showToast('일부 이미지 업로드에 실패했습니다.', 'error');
        // 업로드 실패한 이미지는 미리보기에서도 제거
        newImages.pop();
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setUploadedImageUrls(prev => [...prev, ...newUploadedUrls]);
    setIsUploadingImages(false);

    if (newUploadedUrls.length > 0) {
      showToast(`${newUploadedUrls.length}개의 이미지가 업로드되었습니다.`, 'success');
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 책 선택 제거 핸들러
  const handleRemoveBook = () => {
    setSelectedBook(null);
  };

  // 글 올리기 핸들러
  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('제목을 입력해주세요.', 'warning');
      return;
    }

    if (!content.trim()) {
      showToast('내용을 입력해주세요.', 'warning');
      return;
    }

    if (!selectedBook) {
      showToast('책을 선택해주세요.', 'warning');
      return;
    }

    // 이미지가 아직 업로드 중인 경우
    if (isUploadingImages) {
      showToast('이미지 업로드 중입니다. 잠시만 기다려주세요.', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      // 게시글 작성 - bookId 포함 (이미 업로드된 URL 사용)
      const postData: any = {
        title: title.trim(),
        content: content.trim(),
        images: uploadedImageUrls,
      };

      // selectedBook의 memberBookId를 bookId로 전달
      if (selectedBook?.bookId) {
        postData.bookId = selectedBook.bookId;
      }

      console.log('게시글 작성 데이터:', postData);

      const response = await createPost(postData);

      if (response.isSuccess) {
        // 게시글 작성 성공 시 임시 저장 데이터 삭제
        localStorage.removeItem('writePostDraft');
        navigate('/community');
      } else {
        showToast(response.message || '게시글 작성에 실패했습니다.', 'error');
      }
    } catch (error: any) {
      console.error('게시글 작성 중 오류:', error);
      showToast('게시글 작성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <header className="detail-header">
        <button className="header-left-arrow" onClick={() => navigate(-1)}>
          <span
            className="mgc_close_line"
          ></span>
        </button>
        <h3>글쓰기</h3>
        <div className="header-right-wrapper">
          <button
            className="header-menu-button"
          >
          </button>
        </div>
      </header>

      <div className="header-margin"></div>

      <div className="write-post-content">
        <div className="form-section">
          <input
            type="text"
            className="title-input"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="form-section">
          <textarea
            className="content-input"
            placeholder="내용을 입력하세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
          />
        </div>

        <div className="image-section">
          <div className="image-grid">
            <div className="image-upload-slot">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="post-page-camera-button">
                <span className="mgc_camera_2_fill"></span>
              </label>
            </div>

            {images.map((image, index) => (
              <div key={index} className="image-slot">
                <img src={image} alt={`업로드 ${index + 1}`} />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage(index)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="book-section">
          <div className="book-label-section">          
            <div className="book-label">책 선택하기</div>
            <div className="book-hint">내 책장에서 책을 선택해주세요</div>
          </div>
          
          {selectedBook ? (
            // 선택된 책 표시
            <div className="selected-book-card">
              <img src={selectedBook.imageUrl} alt={selectedBook.title} className="selected-book-image" />
              <div className="selected-book-info">
                <p className="selected-book-title">{selectedBook.title}</p>
                <p className="selected-book-author">{selectedBook.author}</p>
              </div>
              <button 
                className="remove-book-button"
                onClick={handleRemoveBook}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ) : (
            <button className="bookshelf-button" onClick={handleBookSelection}>
              <span>책 선택하기</span>
              <span className="mgc_right_fill"></span>
            </button>
          )}
        </div>

        <div className="submit-section">
          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImages || !title.trim() || !content.trim() || !selectedBook}
          >
            {isSubmitting ? '작성 중...' : isUploadingImages ? '이미지 업로드 중...' : '글 올리기'}
          </button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default WritePostPage;
