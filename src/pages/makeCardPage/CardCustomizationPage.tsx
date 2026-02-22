import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CardCustomizationPage.css';
import Toast from '../../components/Toast';
import { Sparkles } from 'lucide-react';
const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const isDataOrBlob = url.startsWith('data:') || url.startsWith('blob:');
        if (!isDataOrBlob) {
            img.crossOrigin = 'anonymous';
            const separator = url.includes('?') ? '&' : '?';
            img.src = `${url}${separator}t=${Date.now()}`;
        } else {
            img.src = url;
        }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`이미지 로드 실패: ${url.substring(0, 50)}`));
    });
};

import PicFillIconSVG from '../../assets/icons/CustomizePage/pic_fill.svg?react';
import FontSizeFillIconSVG from '../../assets/icons/CustomizePage/font_size_fill.svg?react';
import CheckFillIconSVG from '../../assets/icons/CustomizePage/check_fill.svg?react';

import CameraIcon from '../../assets/icons/camera.svg';
import GalleryIcon from '../../assets/icons/gallery.svg';

import Book1 from '../../assets/images/cardSample/Book/book1.jpg';
import Book2 from '../../assets/images/cardSample/Book/book2.jpg';

import Cafe1 from '../../assets/images/cardSample/Cafe/cafe1.jpg';
import Cafe2 from '../../assets/images/cardSample/Cafe/cafe2.jpg';
import Cafe3 from '../../assets/images/cardSample/Cafe/cafe3.jpg';

import Landscape1 from '../../assets/images/cardSample/Landscape/landscape1.jpg';
import Landscape2 from '../../assets/images/cardSample/Landscape/landscape2.jpg';
import Landscape3 from '../../assets/images/cardSample/Landscape/landscape3.jpg';
import Landscape4 from '../../assets/images/cardSample/Landscape/landscape4.jpg';
import Landscape5 from '../../assets/images/cardSample/Landscape/landscape5.jpg';
import Landscape6 from '../../assets/images/cardSample/Landscape/landscape6.jpg';
import Landscape7 from '../../assets/images/cardSample/Landscape/landscape7.jpg';
import Landscape8 from '../../assets/images/cardSample/Landscape/landscape8.jpg';
import Landscape9 from '../../assets/images/cardSample/Landscape/landscape9.jpg';

import SolidColor1 from '../../assets/images/cardSample/SolidColor/solidcolor1.png';
import SolidColor2 from '../../assets/images/cardSample/SolidColor/solidcolor2.png';
import SolidColor3 from '../../assets/images/cardSample/SolidColor/solidcolor3.png';
import SolidColor4 from '../../assets/images/cardSample/SolidColor/solidcolor4.png';
import SolidColor5 from '../../assets/images/cardSample/SolidColor/solidcolor5.png';
import SolidColor6 from '../../assets/images/cardSample/SolidColor/solidcolor6.png';

const CardCustomizationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const image = location.state?.image as string | undefined;
    const extractedText = location.state?.extractedText as string | undefined;

    const [selectedTab, setSelectedTab] = useState<'image' | 'text' | 'effect'>('image');
    const [isBlocked, setIsBlocked] = useState(false);
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

    const backgroundCategories = {
        'my-photo': [
            { label: '촬영 사진', url: image, id: 'uploaded' },
            { label: '카메라열기', url: CameraIcon, id: 'camera' },
            { label: '갤러리열기', url: GalleryIcon, id: 'gallery' }
        ],
        'pattern': [
            { label: '패턴1', url: SolidColor1, id: 'pattern1' },
            { label: '패턴2', url: SolidColor2, id: 'pattern2' },
            { label: '패턴3', url: SolidColor3, id: 'pattern3' },
            { label: '패턴4', url: SolidColor4, id: 'pattern4' },
            { label: '패턴5', url: SolidColor5, id: 'pattern5' },
            { label: '패턴6', url: SolidColor6, id: 'pattern6' },
        ],
        'landscape': [
            { label: '풍경1', url: Landscape1, id: 'landscape1' },
            { label: '풍경2', url: Landscape2, id: 'landscape2' },
            { label: '풍경3', url: Landscape3, id: 'landscape3' },
            { label: '풍경4', url: Landscape4, id: 'landscape4' },
            { label: '풍경5', url: Landscape5, id: 'landscape5' },
            { label: '풍경6', url: Landscape6, id: 'landscape6' },
            { label: '풍경7', url: Landscape7, id: 'landscape7' },
            { label: '풍경8', url: Landscape8, id: 'landscape8' },
            { label: '풍경9', url: Landscape9, id: 'landscape9' },
        ],
        'book': [
            { label: '책1', url: Book1, id: 'book1' },
            { label: '책2', url: Book2, id: 'book2' },
        ],
        'cafe': [
            { label: '카페1', url: Cafe1, id: 'cafe1' },
            { label: '카페2', url: Cafe2, id: 'cafe2' },
            { label: '카페3', url: Cafe3, id: 'cafe3' },
        ],
    };

    const fonts = [
        { label: 'Pretendard', value: 'Pretendard, sans-serif', id: 'pretendard' },
        { label: 'Nanum Gothic', value: '"Nanum Gothic", sans-serif', id: 'nanum-gothic' },
        { label: 'Gungsuh', value: '"Gungsuh", serif', id: 'gungsuh' },
        { label: 'Cafe24 Ssurround', value: '"Cafe24 Ssurround", sans-serif', id: 'cafe24' },
        { label: 'Galmuri', value: 'Galmuri, sans-serif', id: 'galmuri' },
        { label: 'Jalnan', value: 'Jalnan, sans-serif', id: 'jalnan' },
    ];

    const [selectedBackgroundCategory, setSelectedBackgroundCategory] = useState<'my-photo' | 'pattern' | 'landscape' | 'book' | 'cafe'>('my-photo');
    const [selectedBackground, setSelectedBackground] = useState<'uploaded' | string>('uploaded');
    const [selectedFontId, setSelectedFontId] = useState<string>(fonts[0]?.id || 'pretendard');
    
    const [selectedEffect, setSelectedEffect] = useState<'none' | 'blur' | 'darkness'>('none');
    const [effectIntensity, setEffectIntensity] = useState<number>(50);
    
    const [textPosition, setTextPosition] = useState({ x: 16, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const cardPreviewRef = useRef<HTMLDivElement>(null);
    
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const getBackgroundImage = () => {
        if (selectedBackground === 'uploaded') return image;
        if (selectedBackground === 'camera' || selectedBackground === 'gallery') {
            return selectedImage || image;
        }
        
        const category = backgroundCategories[selectedBackgroundCategory];
        if (category) {
            const found = category.find((bg) => bg.id === selectedBackground);
            if (found) return found.url;
        }
        
        return image;
    };

    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    const handleGalleryClick = () => {
        galleryInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'gallery') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                if (result) {
                    setSelectedImage(result);
                    setSelectedBackground(source);
                    showToast(`${source === 'camera' ? '카메라' : '갤러리'}에서 이미지를 가져왔습니다.`, 'success');
                }
            };
            reader.onerror = () => {
                showToast('이미지를 읽는 중 오류가 발생했습니다.', 'error');
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    useEffect(() => {
        if ((!image || !extractedText) && !isBlocked) {
            showToast('필수 데이터 (이미지, 텍스트)가 누락되었습니다. 카드 생성 페이지로 이동합니다.', 'error');
            setIsBlocked(true);
            navigate('/make-card', { replace: true });
        }
    }, [image, extractedText, navigate, isBlocked]);

    if (isBlocked) {
        return null;
    }



    if (!image && !isBlocked) {
        return (
            <div className="page-container">
                <p>필수 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    const handleStart = (clientX: number, clientY: number, target: HTMLElement) => {
        const rect = target.getBoundingClientRect();
        setDragOffset({
            x: clientX - rect.left,
            y: clientY - rect.top
        });
        setIsDragging(true);
    };

    const handleMove = (clientX: number, clientY: number, container: HTMLElement) => {
        if (!isDragging) return;
        
        const rect = container.getBoundingClientRect();
        const newX = clientX - rect.left - dragOffset.x;
        const newY = clientY - rect.top - dragOffset.y;
        
        // 컨테이너 전체 영역에서 드래그 가능하도록 설정
        const textElement = document.querySelector('.overlay-text') as HTMLElement;
        const textWidth = textElement ? textElement.offsetWidth : 200;
        const textHeight = textElement ? textElement.offsetHeight : 100;
        
        // 컨테이너 전체를 기준으로 제한
        const maxX = rect.width - textWidth;
        const maxY = rect.height - textHeight;
        
        setTextPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    // 마우스 이벤트
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY, e.currentTarget as HTMLElement);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        handleMove(e.clientX, e.clientY, e.currentTarget as HTMLElement);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    // 터치 이벤트
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
            handleStart(touch.clientX, touch.clientY, e.currentTarget as HTMLElement);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
            handleMove(touch.clientX, touch.clientY, e.currentTarget as HTMLElement);
        }
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    const getSelectedFontValue = () => {
        const selectedFont = fonts.find(font => font.id === selectedFontId);
        return selectedFont?.value || 'inherit';
    };

    const handleSave = async () => {
        const currentImage = getBackgroundImage();
        if (!currentImage || !extractedText) {
            showToast('이미지와 텍스트는 필수로 포함되어야 합니다. 저장할 수 없습니다.', 'error');
            return;
        }

        if (!cardPreviewRef.current) {
            showToast('카드 미리보기를 캡쳐할 수 없습니다.', 'error');
            return;
        }

        try {
            showToast('카드를 생성 중입니다...', 'info');

            const drawable = await loadImage(currentImage);

            const cardWidth = cardPreviewRef.current.offsetWidth;
            const scale = 2;
            const canvas = document.createElement('canvas');
            canvas.width = cardWidth * scale;
            canvas.height = cardWidth * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas context를 가져올 수 없습니다.');
            }

            ctx.save();
            if (selectedEffect === 'blur') {
                ctx.filter = `blur(${effectIntensity * 0.1 * scale}px)`;
            } else if (selectedEffect === 'darkness') {
                ctx.filter = `brightness(${1 - effectIntensity * 0.01})`;
            }
            ctx.drawImage(drawable, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            ctx.filter = 'none';

            const textElement = cardPreviewRef.current.querySelector('.overlay-text') as HTMLElement;
            if (textElement) {
                const computedStyle = window.getComputedStyle(textElement);
                const fontSize = parseFloat(computedStyle.fontSize) * scale;
                const fontFamily = getSelectedFontValue();
                const color = computedStyle.color;
                const baseLineHeight = parseFloat(computedStyle.lineHeight);
                const lineHeight = (baseLineHeight || fontSize * 1.6) * scale;
                const padding = parseFloat(computedStyle.padding) * scale;
                
                ctx.save();
                ctx.font = `${computedStyle.fontWeight || '400'} ${fontSize}px ${fontFamily}`;
                ctx.fillStyle = color;
                ctx.textBaseline = 'top';
                
                const textX = textPosition.x * scale + padding;
                const textY = textPosition.y * scale + padding;
                
                const maxWidth = (cardWidth - textPosition.x - 16) * scale - (padding * 2);
                const lines = extractedText.split('\n');
                let y = textY;
                
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const lineText = lines[lineIndex] || '';
                    const words = lineText.split(' ');
                    let line = '';
                    
                    for (let i = 0; i < words.length; i++) {
                        const testLine = line + words[i] + ' ';
                        const metrics = ctx.measureText(testLine);
                        
                        if (metrics.width > maxWidth && i > 0) {
                            ctx.fillText(line.trim(), textX, y);
                            line = words[i] + ' ';
                            y += lineHeight;
                        } else {
                            line = testLine;
                        }
                    }
                    if (line.trim()) {
                        ctx.fillText(line.trim(), textX, y);
                        y += lineHeight;
                    }
                    if (lineIndex < lines.length - 1 && lines[lineIndex + 1] === '') {
                        y += lineHeight;
                    }
                }
                
                ctx.restore();
            }

            const capturedImage = canvas.toDataURL('image/png');

            navigate('/card-book-search-before', {
                state: {
                    image: capturedImage,
                    extractedText,
                    font: getSelectedFontValue(),
                    textPosition: textPosition,
                    effect: selectedEffect,
                    effectIntensity: effectIntensity,
                },
            });
        } catch (error) {
            console.error('캡쳐 실패 상세:', error);
            showToast('이미지 보안 정책(CORS)으로 인해 저장이 불가능할 수 있습니다. 직접 올린 사진을 사용해 보세요.', 'error');
        }
    };

    return (
        <div className="page-container">
            <div className="card-customization-wrapper">
                <header className="customization-header">
                    <button 
                        className="customization-cancel-btn" 
                        onClick={() => {
                            navigate('/make-card');
                        }}
                    >
                        취소
                    </button>
                    <span className="spacer" />
                    <button className="save-btn" onClick={handleSave}>
                        저장
                    </button>
                </header>

                <div
                    ref={cardPreviewRef}
                    className="custom-card-preview"
                    style={{ 
                        position: 'relative',
                        overflow: 'hidden',
                        touchAction: 'none'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                >
                    <div
                        className="custom-card-background"
                        style={{ 
                            backgroundImage: `url(${getBackgroundImage()})`,
                            filter: selectedEffect === 'blur' 
                                ? `blur(${effectIntensity * 0.1}px)` 
                                : selectedEffect === 'darkness' 
                                ? `brightness(${1 - effectIntensity * 0.01})`
                                : 'none',
                        }}
                    />
                    <div
                        className={`overlay-text ${isDragging ? 'dragging' : ''}`}
                        style={{ 
                            fontFamily: getSelectedFontValue(),
                            left: `${textPosition.x}px`,
                            top: `${textPosition.y}px`,
                            cursor: isDragging ? 'grabbing' : 'grab',
                            touchAction: 'none'
                        }}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                    >
                        {extractedText}
                    </div>
                </div>

                <div className="option-panel">
                    {selectedTab === 'image' && (
                        <div className="background-customization">
                            <div className="category-tabs">
                                <button
                                    className={`category-tab ${selectedBackgroundCategory === 'my-photo' ? 'active' : ''}`}
                                    onClick={() => setSelectedBackgroundCategory('my-photo')}
                                >
                                    내 사진
                                </button>
                                <button
                                    className={`category-tab ${selectedBackgroundCategory === 'pattern' ? 'active' : ''}`}
                                    onClick={() => setSelectedBackgroundCategory('pattern')}
                                >
                                    패턴
                                </button>
                                <button
                                    className={`category-tab ${selectedBackgroundCategory === 'landscape' ? 'active' : ''}`}
                                    onClick={() => setSelectedBackgroundCategory('landscape')}
                                >
                                    풍경
                                </button>
                                <button
                                    className={`category-tab ${selectedBackgroundCategory === 'book' ? 'active' : ''}`}
                                    onClick={() => setSelectedBackgroundCategory('book')}
                                >
                                    책
                                </button>
                                <button
                                    className={`category-tab ${selectedBackgroundCategory === 'cafe' ? 'active' : ''}`}
                                    onClick={() => setSelectedBackgroundCategory('cafe')}
                                >
                                    카페
                                </button>
                            </div>
                            <div className="options-scroll">
                                <div className="option-icons">
                                    {selectedBackgroundCategory === 'my-photo' && (
                                        <>
                                            {image && (
                                                <div>
                                                    <div
                                                        className={`option ${selectedBackground === 'uploaded' ? 'active' : ''}`}
                                                        onClick={() => setSelectedBackground('uploaded')}
                                                        style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover' }}
                                                    >
                                                        {selectedBackground === 'uploaded' && (
                                                            <CheckFillIconSVG className="check-icon" />
                                                        )}
                                                    </div>
                                                    <div className="option-label">촬영 사진</div>
                                                </div>
                                            )}
                                            <div>
                                                <div
                                                    className={`option ${selectedBackground === 'camera' ? 'active' : ''}`}
                                                    onClick={handleCameraClick}
                                                    style={{ 
                                                        backgroundColor: '#E7E9EF'
                                                    }}
                                                >
                                                    <span className="mgc_camera_2_ai_fill"></span>
                                                    {selectedBackground === 'camera' && (
                                                        <CheckFillIconSVG className="check-icon" />
                                                    )}
                                                </div>
                                                <div className="option-label">카메라열기</div>
                                            </div>
                                            <div>
                                                <div
                                                    className={`option ${selectedBackground === 'gallery' ? 'active' : ''}`}
                                                    onClick={handleGalleryClick}
                                                    style={{ 
                                                        backgroundColor: '#E7E9EF'
                                                    }}
                                                >
                                                    <span className="mgc_pic_fill"></span>
                                                    {selectedBackground === 'gallery' && (
                                                        <CheckFillIconSVG className="check-icon" />
                                                    )}
                                                </div>
                                                <div className="option-label">갤러리열기</div>
                                            </div>
                                            {selectedImage && (selectedBackground === 'camera' || selectedBackground === 'gallery') && (
                                                <div>
                                                    <div
                                                        className="option active"
                                                        style={{ backgroundImage: `url(${selectedImage})`, backgroundSize: 'cover' }}
                                                    >
                                                        <CheckFillIconSVG className="check-icon" />
                                                    </div>
                                                    <div className="option-label">선택한 이미지</div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {selectedBackgroundCategory !== 'my-photo' && backgroundCategories[selectedBackgroundCategory]?.map((bg) => (
                                        <div key={bg.id}>
                                            <div
                                                className={`option ${selectedBackground === bg.id ? 'active' : ''}`}
                                                onClick={() => setSelectedBackground(bg.id)}
                                                style={{ backgroundImage: `url(${bg.url})`, backgroundSize: 'cover' }}
                                            >
                                                {selectedBackground === bg.id && (
                                                    <CheckFillIconSVG className="check-icon" />
                                                )}
                                            </div>
                                            <div className="option-label">{bg.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={cameraInputRef}
                                accept="image/*"
                                capture="environment"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(e, 'camera')}
                            />
                            <input
                                type="file"
                                ref={galleryInputRef}
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(e, 'gallery')}
                            />
                        </div>
                    )}

                    {selectedTab === 'text' && (
                        <div className="font-customization">
                            <div className="category-tabs"></div>
                            <div className="options-scroll">
                                <div className="option-icons">
                                    {fonts.map((font) => (
                                        <div key={font.id}>
                                            <div
                                                className={`option ${selectedFontId === font.id ? 'active' : ''}`}
                                                onClick={() => setSelectedFontId(font.id)}
                                                style={{ fontFamily: font.value, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2em' }}
                                            >
                                                {selectedFontId === font.id && (
                                                    <CheckFillIconSVG className="check-icon" />
                                                )}
                                                <span style={{ color: 'black', textShadow: '0 0 2px white' }}>가</span>
                                            </div>
                                            <div className="option-label">{font.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'effect' && (
                        <div className="effect-customization">
                            <div className="category-tabs">
                                <button
                                    className={`category-tab ${selectedEffect === 'none' ? 'active' : ''}`}
                                    onClick={() => setSelectedEffect('none')}
                                >
                                    없음
                                </button>
                                <button
                                    className={`category-tab ${selectedEffect === 'blur' ? 'active' : ''}`}
                                    onClick={() => setSelectedEffect('blur')}
                                >
                                    블러
                                </button>
                                <button
                                    className={`category-tab ${selectedEffect === 'darkness' ? 'active' : ''}`}
                                    onClick={() => setSelectedEffect('darkness')}
                                >
                                    어두움
                                </button>
                            </div>
                            <div className="effect-slider-container">
                                {selectedEffect !== 'none' && (
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={effectIntensity}
                                        onChange={(e) => setEffectIntensity(Number(e.target.value))}
                                        className="effect-slider"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                </div>

                <div className="tab-buttons">
                    <button
                        className={selectedTab === 'image' ? 'tab-selected' : 'tab'}
                        onClick={() => setSelectedTab('image')}
                    >
                        <div className="tab-icon">
                            <PicFillIconSVG className={`tab-icon-svg ${selectedTab === 'image' ? 'active' : ''}`} />
                        </div>
                        <div className="tab-label">배경</div>
                    </button>
                    <button
                        className={selectedTab === 'text' ? 'tab-selected' : 'tab'}
                        onClick={() => setSelectedTab('text')}
                    >
                        <div className="tab-icon">
                            <FontSizeFillIconSVG className={`tab-icon-svg ${selectedTab === 'text' ? 'active' : ''}`} />
                        </div>
                        <div className="tab-label">글자</div>
                    </button>
                    <button
                        className={selectedTab === 'effect' ? 'tab-selected' : 'tab'}
                        onClick={() => setSelectedTab('effect')}
                    >
                        <div className="tab-icon">
                            <Sparkles className={`tab-icon-svg ${selectedTab === 'effect' ? 'active' : ''}`} size={32} />
                        </div>
                        <div className="tab-label">효과</div>
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

export default CardCustomizationPage;
