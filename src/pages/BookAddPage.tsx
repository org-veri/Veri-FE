import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BookAddPage.css';
import {
    createBook,
    type CreateBookRequest,
    type BookSearchResult
} from '../api/bookApi';

function BookAddPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const initialBookInfo = location.state?.bookInfo as BookSearchResult | undefined;

    const title = initialBookInfo?.title || '';
    const imageUrl = initialBookInfo?.imageUrl || '';
    const author = initialBookInfo?.author || '';
    const publisher = initialBookInfo?.publisher || '';
    const isbn = initialBookInfo?.isbn || '';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

    useEffect(() => {
        if (!initialBookInfo) {
            alert('책 정보를 불러올 수 없습니다. 책 검색 페이지로 이동합니다.');
            navigate('/book-search', { replace: true });
        }
    }, [initialBookInfo, navigate]);

    const handleRegisterBook = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        if (!title.trim() || !imageUrl.trim() || !author.trim() || !publisher.trim() || !isbn.trim()) {
            setSubmitError('필수 책 정보가 누락되었습니다. (제목, 이미지, 저자, 출판사, ISBN)');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload: CreateBookRequest = {
                title: title.trim(),
                image: imageUrl.trim(),
                author: author.trim(),
                publisher: publisher.trim(),
                isbn: isbn.trim(),
            };

            const response = await createBook(payload);

            if (response.isSuccess) {
                setSubmitSuccess(true);
                alert('책이 성공적으로 등록되었습니다!');
                navigate('/library');
            } else {
                setSubmitError(response.message || '책 등록에 실패했습니다.');
            }
        } catch (err: any) {
            console.error('책 등록 중 예상치 못한 오류:', err);
            setSubmitError('책 등록 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'));
        } finally {
            setIsSubmitting(false);
        }
    }, [title, imageUrl, author, publisher, isbn, navigate]);
    if (!initialBookInfo) {
        return (
            <div className="loading-page-container">
                {submitError ? <p style={{ color: 'red' }}>{submitError}</p> : <p>책 정보를 불러오는 중...</p>}
                {submitError && <button onClick={() => navigate(-1)} className="back-button">뒤로 가기</button>}
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="detail-header">
                <button className="white-header-left-arrow" onClick={() => navigate(-1)}>
                <span
                        className="mgc_left_fill"
                    ></span>
                </button>
                <h3 className='h3-white'>새 책 등록</h3>
                <div className="header-right-wrapper">
                    <div className="dummy-box" />
                </div>
            </header>

            <form onSubmit={handleRegisterBook} className="book-register-form">
                <div className="book-info-section">
                    <div className="book-cover-detail-container">
                        <img
                            src={imageUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                            alt={title || '책 표지'}
                            className="book-cover-detail"
                        />
                        <div className="top-shadow-overlay" />
                    </div>
                    <div className="book-info-detail-container">
                        <p className="book-title-display">{title}</p>
                        <p className="book-author-display">{author}</p>
                    </div>
                </div>

                {submitSuccess && <p className="success-message">책이 성공적으로 등록되었습니다!</p>}
                {submitError && <p className="error-message">{submitError}</p>}

                <div className="add-book-container">
                    <button type="submit" className="add-book-button" disabled={isSubmitting}>
                        {isSubmitting ? '등록 중...' : '책 등록하기'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BookAddPage;