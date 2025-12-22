import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { extractTextFromImage } from '../../api/ocrApi';
import Toast from '../../components/Toast';
import CardLoading from '../../assets/images/CardLoading.png';

import './TextExtractionLoadingPage.css';

const TextExtractionLoadingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const image = location.state?.image as string | undefined;
    const bookId = location.state?.bookId as number | undefined;

    const [isLoadingText, setIsLoadingText] = useState(true);
    const [ocrError, setOcrError] = useState<string | null>(null);
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
        const performOcrAndNavigate = async () => {
            if (!image) {
                console.error('TextExtractionLoadingPage: 필수 데이터 (이미지 URL) 누락, make-card로 리디렉션.');
                showToast('이미지 데이터를 불러올 수 없습니다. 카드 생성 페이지로 돌아갑니다.', 'error');
                navigate('/make-card', { replace: true });
                return;
            }

            // 중복 처리 방지를 위한 세션스토리지 체크
            const processingKey = `ocr_processing_${image}`;
            const isProcessing = sessionStorage.getItem(processingKey);

            if (isProcessing) {
                // 이미 처리 중이거나 완료된 경우
                const result = sessionStorage.getItem(`ocr_result_${image}`);
                if (result) {
                    const parsedResult = JSON.parse(result);
                    if (parsedResult.success) {
                        navigate('/text-extraction-result', {
                            state: {
                                image,
                                extractedText: parsedResult.text,
                                bookId,
                            },
                            replace: true
                        });
                    } else {
                        setOcrError(parsedResult.error);
                        setIsLoadingText(false);
                    }
                }
                return;
            }

            sessionStorage.setItem(processingKey, 'true');

            setIsLoadingText(true);
            setOcrError(null);

            try {
                const extractedText = await extractTextFromImage(image);

                if (!extractedText || extractedText.trim().length === 0) {
                    sessionStorage.removeItem(processingKey);
                    navigate('/use-photo', {
                        replace: true,
                        state: {
                            image,
                            errorMessage: '이미지에서 텍스트가 감지되지 않았습니다. 다른 이미지를 시도하거나 직접 입력해 주세요.',
                            errorType: 'warning'
                        }
                    });
                    return;
                }

                sessionStorage.setItem(`ocr_result_${image}`, JSON.stringify({
                    success: true,
                    text: extractedText
                }));

                navigate('/text-extraction-result', {
                    state: {
                        image,
                        extractedText,
                        bookId,
                    },
                    replace: true // 히스토리에서 현재 페이지를 교체
                });
            } catch (err: any) {
                console.error('OCR 처리 중 오류 발생:', err);
                const errorMessage = `텍스트 추출 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}.`;
                setOcrError(errorMessage);

                sessionStorage.setItem(`ocr_result_${image}`, JSON.stringify({
                    success: false,
                    error: errorMessage
                }));

            } finally {
                setIsLoadingText(false);
                sessionStorage.removeItem(processingKey);
            }
        };

        performOcrAndNavigate();
    }, [navigate, image, bookId]);

    // 컴포넌트 언마운트 시 세션스토리지 정리
    useEffect(() => {
        return () => {
            if (image) {
                const processingKey = `ocr_processing_${image}`;
                sessionStorage.removeItem(processingKey);
            }
        };
    }, [image]);

    return (
        <div className="page-container">
            <header className="detail-header">
                <button className="header-left-arrow" onClick={() => navigate('/make-card')}>
                    <span
                        className="mgc_left_fill"
                    ></span>
                </button>
                <h3>텍스트 분석</h3>
                <div className="dummy-box"></div>
            </header>

            <div className="header-margin"></div>

            <div className="text-extraction-wrapper">
                <div className="text-extraction-loading-page">
                    <header className="loading-header">
                        {isLoadingText ? (
                            <>
                                <h3>텍스트를 분석중이에요</h3>
                                <p>결과가 나올때까지 조금만 기다려주세요!</p>
                            </>
                        ) : ocrError ? (
                            <h3 style={{ color: 'red' }}>오류 발생!</h3>
                        ) : (
                            <h3>분석 완료!</h3>
                        )}
                    </header>

                    <div className="loading-content">
                        <img
                            src={CardLoading}
                            alt="텍스트 분석 중"
                            style={{ marginTop: '20px', maxWidth: '80%', borderRadius: '8px' }}
                        />
                        {ocrError ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'red', marginBottom: '20px' }}>{ocrError}</p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => window.location.reload()}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        다시 시도
                                    </button>
                                    <button
                                        onClick={() => navigate('/make-card')}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        새 이미지 선택
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p>오늘도 화이팅!</p>
                        )}
                    </div>
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

export default TextExtractionLoadingPage;