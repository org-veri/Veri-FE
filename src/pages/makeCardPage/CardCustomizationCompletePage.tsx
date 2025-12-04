import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationCompletePage.css';
import { createCard, uploadImageAndGetUrl } from '../../api/cardApi';
import { getBookById, type GetBookByIdResponse } from '../../api/bookApi';
import Toast from '../../components/Toast';
import downIcon from '../../assets/icons/down.svg';
import instarIcon from '../../assets/icons/instar.svg';

const CardCustomizationCompletePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;
    const memberBookId = location.state?.bookId as number | undefined;
    const selectedFont = location.state?.font as string | undefined;
    const textPosition = location.state?.textPosition as { x: number; y: number } | undefined;

    const cardRef = useRef<HTMLDivElement>(null);
    const hasSaved = useRef(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [bookTitle, setBookTitle] = useState<string>('책 제목 불러오는 중...');
    const [bookDetail, setBookDetail] = useState<GetBookByIdResponse['result'] | null>(null);
    const [_savedCardId, setSavedCardId] = useState<number | null>(null);
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
        const fetchBookDetails = async () => {
            if (memberBookId !== undefined) {
                try {
                    const response: GetBookByIdResponse = await getBookById(memberBookId);
                    if (response.isSuccess && response.result) {
                        setBookTitle(response.result.title);
                        setBookDetail(response.result);
                    } else {
                        console.error('Failed to fetch book details:', response.message);
                        setBookTitle('책 제목 불러오기 실패');
                        setBookDetail(null);
                    }
                } catch (err) {
                    console.error('Error fetching book details:', err);
                    setBookTitle('책 제목 불러오기 실패');
                    setBookDetail(null);
                }
            } else {
                setBookTitle('책 ID 없음');
                setBookDetail(null);
            }
        };

        fetchBookDetails();
    }, [memberBookId]);

    const handleGoToDownloadPage = useCallback(() => {
        if (image && extractedText && memberBookId !== undefined && bookDetail) {
            const cardDataForDownloadPage = {
                cardId: undefined,
                content: extractedText,
                imageUrl: image,
                createdAt: new Date().toISOString(),
                book: {
                    id: bookDetail.memberBookId,
                    title: bookDetail.title,
                    author: bookDetail.author,
                },
                textPosition: textPosition, // 텍스트 위치 정보 추가
            };
            navigate('/download-card', { state: { cardDetail: cardDataForDownloadPage, action: 'download' } });
        } else {
            alert('다운로드 페이지로 이동할 정보를 준비하는 데 실패했습니다. (이미지, 텍스트, 책 정보 확인)');
            console.error('다운로드 페이지 이동 실패: 필수 데이터 누락', { image, extractedText, memberBookId, bookDetail });
        }
    }, [image, extractedText, memberBookId, bookDetail, navigate, textPosition]);

    const handleShare = useCallback(() => {
        if (image && extractedText && memberBookId !== undefined && bookDetail) {
            const cardDataForDownloadPage = {
                cardId: undefined,
                content: extractedText,
                imageUrl: image,
                createdAt: new Date().toISOString(),
                book: {
                    id: bookDetail.memberBookId,
                    title: bookDetail.title,
                    author: bookDetail.author,
                },
                textPosition: textPosition, // 텍스트 위치 정보 추가
            };
            navigate('/download-card', { state: { cardDetail: cardDataForDownloadPage, action: 'share' } });
        } else {
            alert('공유 페이지로 이동할 정보를 준비하는 데 실패했습니다. (이미지, 텍스트, 책 정보 확인)');
            console.error('공유 페이지 이동 실패: 필수 데이터 누락', { image, extractedText, memberBookId, bookDetail });
        }
    }, [image, extractedText, memberBookId, bookDetail, navigate, textPosition]);

    const handleSave = useCallback(async () => {
        if (hasSaved.current || isSaving || !extractedText || memberBookId === undefined) {
            if (!hasSaved.current && !isSaving) {
                console.error('카드를 저장하는 데 필요한 정보가 부족합니다. (텍스트 또는 책 ID)');
                setSaveError('카드 저장에 필요한 정보가 부족합니다.');
            }
            return;
        }

        if (!image) {
            console.error('카드를 저장하는 데 필요한 이미지 URL이 없습니다.');
            setSaveError('카드 저장에 필요한 이미지 URL이 없습니다.');
            return;
        }

        hasSaved.current = true;
        setIsSaving(true);
        setSaveError(null);

        try {
            let imageUrlToSave = image;

            // base64 이미지인 경우 S3에 업로드
            if (image.startsWith('data:image')) {
                try {
                    showToast('이미지를 업로드하는 중입니다...', 'info');
                    
                    // base64를 Blob으로 변환
                    const base64Data = image.split(',')[1]; // data:image/png;base64, 부분 제거
                    if (!base64Data) {
                        throw new Error('base64 데이터를 추출할 수 없습니다.');
                    }
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/png' });
                    
                    // Blob을 File로 변환
                    const file = new File([blob], 'card-image.png', { type: 'image/png' });
                    
                    // S3에 업로드하고 publicUrl 받기
                    imageUrlToSave = await uploadImageAndGetUrl(file);
                    
                    console.log('이미지 업로드 완료:', imageUrlToSave);
                } catch (uploadError: any) {
                    console.error('이미지 업로드 실패:', uploadError);
                    setSaveError(`이미지 업로드 실패: ${uploadError.message || '알 수 없는 오류'}`);
                    setIsSaving(false);
                    hasSaved.current = false;
                    return;
                }
            }

            const response = await createCard({
                memberBookId: memberBookId,
                content: extractedText,
                imageUrl: imageUrlToSave,
            });

            console.log('카드가 성공적으로 저장되었어요! 카드 ID:', response.result.cardId);
            setSavedCardId(response.result.cardId);
            showToast('독서카드가 성공적으로 생성 및 저장되었습니다!', 'success');

        } catch (saveError: any) {
            console.error('카드 메타데이터 저장 중 오류:', saveError);
            setSaveError(`카드 저장 실패: ${saveError.message || '알 수 없는 오류'}`);
            hasSaved.current = false; // 에러 발생 시 다시 시도할 수 있도록
        } finally {
            setIsSaving(false);
        }
    }, [isSaving, extractedText, memberBookId, image, showToast]);

    useEffect(() => {
        if (image && extractedText && memberBookId !== undefined && !hasSaved.current) {
            handleSave();
        } else if (!image || !extractedText || memberBookId === undefined) {
            console.error('자동 저장을 위한 필수 데이터가 누락되었습니다. 카드 생성 페이지로 리디렉션합니다.');
            navigate('/make-card');
        }
    }, [image, extractedText, memberBookId, navigate, handleSave]);

    if (!image || !extractedText || memberBookId === undefined || !bookDetail) {
        return <div className="loading-page-container">
            <div className="loading-spinner"></div>
        </div>;
    }

    if (isSaving) {
        return (
            <div className="loading-page-container">
                <p>독서카드를 저장 중입니다...</p>
                {saveError && <p style={{ color: 'red' }}>오류: {saveError}</p>}
            </div>
        );
    }

    if (saveError) {
        return (
            <div className="page-container error-state">
                <p>카드 저장에 실패했습니다.</p>
                <p>오류: {saveError}</p>
                <button onClick={() => navigate('/make-card')}>다시 시도하기</button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="detail-header">
                <button 
                    className="header-left-arrow" 
                    onClick={() => {
                        navigate(`/reading-card`)
                    }}
                >
                <span
                        className="mgc_close_line"
                    ></span>
                </button>
                <h3>나의 독서카드</h3>
                <div className="dummy-box" />
            </header>

            <div className="header-margin"></div>
            <div className="customization-complete-page-wapper">
                <p className="completion-message">독서카드 생성이 완료되었어요!</p>

                <div className="action-icons">
                    <button className="share-icon-btn" onClick={handleShare} aria-label="사진 공유">
                        <img width={20} height={20} src={instarIcon} alt="공유" />
                    </button>

                    <button className="download-icon-btn" onClick={handleGoToDownloadPage} aria-label="다운로드">
                        <img width={20} height={20} src={downIcon} alt="다운로드" />
                    </button>
                </div>

                <div className="card-preview-complete" ref={cardRef}>
                    <div className="card-preview-complete-card">
                        <img 
                            src={image} 
                            alt="완성된 카드" 
                            className="card-image"
                            style={{ 
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/350x500/cccccc/333333?text=Image+Load+Failed';
                                e.currentTarget.alt = '이미지 로드 실패';
                                console.error('Failed to load image for display:', image);
                            }}
                        />
                    </div>

                    <div className="card-summary-text">
                        <strong style={{ fontFamily: selectedFont }}>{bookTitle}</strong>
                        <p className="summary-body" style={{ fontFamily: selectedFont }}>
                            {extractedText.length > 80 ? extractedText.slice(0, 80) + '...' : extractedText}
                        </p>
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

export default CardCustomizationCompletePage;
