import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WritePostPage.css';
import type { BookItem } from '../../api/bookSearchApi';
import { createPost, getPostDetail, updatePost, type UpdatePostRequest } from '../../api/communityApi';
import { uploadImage } from '../../api/imageApi';
import Toast from '../../components/Toast';
import { PATH } from '../../config/routes';

interface SelectedBookInfo extends BookItem {
  bookId?: number;
}

type WritePostLocationState = {
  editPostId?: number;
  selectedBook?: SelectedBookInfo;
};

function WritePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const writePostState = location.state as WritePostLocationState | null;
  const editPostId = writePostState?.editPostId;
  const isEditMode = editPostId != null;
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
    const state = location.state as WritePostLocationState | null;
    const editId = state?.editPostId;

    if (editId != null) {
      (async () => {
        try {
          const res = await getPostDetail(editId);
          if (res.isSuccess && res.result) {
            const p = res.result;
            setTitle(p.title);
            setContent(p.content);
            const urls = p.images?.length ? [...p.images] : [];
            setImages(urls);
            setUploadedImageUrls([...urls]);
            if (state?.selectedBook) {
              setSelectedBook(state.selectedBook);
            } else if (p.book) {
              setSelectedBook({
                ...(p.book.bookId != null ? { bookId: p.book.bookId } : {}),
                title: p.book.title,
                author: p.book.author,
                imageUrl: p.book.imageUrl,
                publisher: p.book.publisher ?? '',
                isbn: p.book.isbn ?? '',
              });
            } else {
              setSelectedBook(null);
            }
          } else {
            showToast(res.message || '게시글을 불러오지 못했습니다.', 'error');
            navigate(-1);
          }
        } catch {
          showToast('게시글을 불러오는 중 오류가 발생했습니다.', 'error');
          navigate(-1);
        } finally {
          setIsInitialLoad(false);
        }
      })();
      return;
    }

    const restoreDraft = () => {
      try {
        if (state?.selectedBook) {
          setSelectedBook(state.selectedBook);
        }

        const savedData = localStorage.getItem('writePostDraft');
        if (savedData) {
          const draft = JSON.parse(savedData);

          setTitle(draft.title || '');
          setContent(draft.content || '');

          if (!state?.selectedBook && draft.selectedBook) {
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
      } catch {
        setIsInitialLoad(false);
      }
    };

    restoreDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialLoad && !isEditMode) {
      try {
        const draft = {
          title,
          content,
          images,
          uploadedImageUrls,
          selectedBook
        };
        localStorage.setItem('writePostDraft', JSON.stringify(draft));
      } catch {}
    }
  }, [title, content, images, uploadedImageUrls, selectedBook, isInitialLoad, isEditMode]);

  const handleGoBack = () => {
    if (isEditMode && editPostId != null) {
      navigate(`${PATH.MY_COMMUNITY_POST}/${editPostId}`, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleBookSelection = () => {
    navigate(PATH.POST_BOOK_SEARCH, {
      state: isEditMode && editPostId != null ? { editPostId } : undefined
    });
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

      try {
        const uploadedUrl = await uploadImage(file);
        newUploadedUrls.push(uploadedUrl);
      } catch {
        showToast('일부 이미지 업로드에 실패했습니다.', 'error');
        newImages.pop();
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setUploadedImageUrls(prev => [...prev, ...newUploadedUrls]);
    setIsUploadingImages(false);

    if (newUploadedUrls.length > 0) {
      showToast(`${newUploadedUrls.length}개의 이미지가 업로드되었습니다.`, 'success');
    }

    event.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveBook = () => {
    setSelectedBook(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('제목을 입력해주세요.', 'warning');
      return;
    }

    if (!content.trim()) {
      showToast('내용을 입력해주세요.', 'warning');
      return;
    }

    if (!isEditMode && !selectedBook) {
      showToast('책을 선택해주세요.', 'warning');
      return;
    }

    if (isUploadingImages) {
      showToast('이미지 업로드 중입니다. 잠시만 기다려주세요.', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editPostId != null) {
        const updateBody: UpdatePostRequest = {
          title: title.trim(),
          content: content.trim(),
          images: uploadedImageUrls,
        };
        if (selectedBook?.bookId != null) {
          updateBody.bookId = selectedBook.bookId;
        }
        const response = await updatePost(editPostId, updateBody);

        if (response.isSuccess) {
          navigate(`${PATH.MY_COMMUNITY_POST}/${editPostId}`, { replace: true });
        } else {
          showToast(response.message || '게시글 수정에 실패했습니다.', 'error');
        }
        return;
      }

      const postData: {
        title: string;
        content: string;
        images: string[];
        bookId?: number;
      } = {
        title: title.trim(),
        content: content.trim(),
        images: uploadedImageUrls,
      };

      if (selectedBook?.bookId) {
        postData.bookId = selectedBook.bookId;
      }

      const response = await createPost(postData);

      if (response.isSuccess) {
        localStorage.removeItem('writePostDraft');
        navigate('/community');
      } else {
        showToast(response.message || '게시글 작성에 실패했습니다.', 'error');
      }
    } catch {
      showToast(isEditMode ? '게시글 수정 중 오류가 발생했습니다.' : '게시글 작성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container write-post-page">
      <header className="write-post-header">
        <button
          type="button"
          className="write-post-back-btn"
          onClick={handleGoBack}
          aria-label="뒤로 가기"
        >
          <span className="mgc_left_fill" aria-hidden />
        </button>
        <h1 className="write-post-title">{isEditMode ? '글 수정하기' : '글쓰기'}</h1>
        <span className="write-post-header-spacer" aria-hidden />
      </header>

      <div className="header-margin" />

      <div className="write-post-content">
        <div className="write-post-form">
          <div className="write-post-title-field">
            <input
              type="text"
              className="write-post-title-input"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="write-post-body-field">
            <textarea
              className="write-post-body-input"
              placeholder="내용을 입력하세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
          </div>

          <div className="write-post-image-row">
            <div className="write-post-image-upload">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="write-post-image-input"
              />
              <label htmlFor="image-upload" className="write-post-camera-btn">
                <span className="mgc_camera_2_fill" aria-hidden />
              </label>
            </div>

            {images.map((image, index) => (
              <div key={index} className="write-post-image-thumb">
                <img src={image} alt={`업로드 ${index + 1}`} />
                <button
                  type="button"
                  className="write-post-image-remove"
                  onClick={() => handleRemoveImage(index)}
                  aria-label="이미지 삭제"
                >
                  <span className="write-post-image-remove-icon" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </div>

        <section className="write-post-book-section">
          <div className="write-post-book-heading">
            <h2 className="write-post-book-label">책 선택하기</h2>
            <p className="write-post-book-hint">내 책장에서 책을 선택해주세요</p>
          </div>

          {selectedBook ? (
            <div className="write-post-selected-book">
              <img
                src={selectedBook.imageUrl}
                alt=""
                className="write-post-selected-book-cover"
              />
              <div className="write-post-selected-book-meta">
                <p className="write-post-selected-book-title">{selectedBook.title}</p>
                <p className="write-post-selected-book-author">{selectedBook.author}</p>
              </div>
              <button
                type="button"
                className="write-post-selected-book-remove"
                onClick={handleRemoveBook}
                aria-label="선택한 책 제거"
              >
                <span className="write-post-image-remove-icon" aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="write-post-bookshelf-btn"
              onClick={handleBookSelection}
            >
              <span>책장 바로가기</span>
              <span className="write-post-bookshelf-chevron" aria-hidden />
            </button>
          )}
        </section>

        <div className="write-post-submit-wrap">
          <button
            type="button"
            className="write-post-submit-btn"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isUploadingImages ||
              !title.trim() ||
              !content.trim() ||
              (!isEditMode && !selectedBook)
            }
          >
            {isSubmitting
              ? isEditMode
                ? '수정 중...'
                : '작성 중...'
              : isUploadingImages
                ? '이미지 업로드 중...'
                : isEditMode
                  ? '수정하기'
                  : '글 올리기'}
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
