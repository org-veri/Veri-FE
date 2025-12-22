import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Toast from '../../components/Toast';
import './UsePhotoPage.css';

const UsePhotoPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { image } = location.state || {};
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

    // OCR 실패로 돌아온 경우 에러 메시지 처리
    useEffect(() => {
        const errorMessage = location.state?.errorMessage as string | undefined;
        const errorType = location.state?.errorType as 'success' | 'error' | 'warning' | 'info' | undefined;

        if (errorMessage) {
            showToast(errorMessage, errorType || 'error');
            navigate(location.pathname, { replace: true, state: { image } });
        }
    }, [location.state, navigate, image]);

    const handleUsePhoto = () => {
        // OCR 페이지로 이동
        navigate('/text-extraction-loading', {
            state: { image }
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="page-container">
            <div className="use-photo-wrapper">
                <header className="detail-header">
                    <button className="header-left-arrow" onClick={handleBack}>
                        <span
                            className="mgc_left_fill"
                        ></span>
                    </button>
                    <div className="dummy-box"></div>
                </header>

                <div className="header-margin"></div>
                <div className="use-photo-image-preview-card">
                    {image ? (
                        <img
                            src={image}
                            alt="선택된 책 사진"
                            className="use-photo-book-image"
                        />
                    ) : (
                        <div className="use-photo-no-image">
                            <p>이미지를 불러올 수 없습니다.</p>
                        </div>
                    )}
                </div>

                <div className="use-photo-button-container">
                    <button
                        className="use-photo-action-button"
                        onClick={handleUsePhoto}
                        disabled={!image}
                    >
                        사진 사용하기
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
};

export default UsePhotoPage;
