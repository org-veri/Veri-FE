import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import GalleryIcon from '../../assets/icons/gallery.svg';
import CameraIcon from '../../assets/icons/camera.svg';

import { uploadImage } from '../../api/imageApi';
import Toast from '../../components/Toast';

import './MakeCardPage.css';

const MakeCardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 전달받은 에러 메시지 처리
  useEffect(() => {
    const errorMessage = location.state?.errorMessage as string | undefined;
    const errorType = location.state?.errorType as 'success' | 'error' | 'warning' | 'info' | undefined;

    if (errorMessage) {
      showToast(errorMessage, errorType || 'warning');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const allAvailableImages = [];
  if (capturedImage) allAvailableImages.push(capturedImage);
  if (selectedGalleryImage) allAvailableImages.push(selectedGalleryImage);
  const imagesToDisplay = allAvailableImages;



  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      setIsVideoReady(false);

      videoRef.current.onloadedmetadata = () => {
        setIsVideoReady(true);
      };

      videoRef.current.play().catch(err => {
        console.error('비디오 재생 에러:', err);
        setCameraError('비디오 재생에 실패했습니다.');
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsVideoReady(false);
    };
  }, [stream]);

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleGalleryClick = () => {
    if (stream) {
      stopCameraStream();
    }
    setIsCameraActive(false);
    setCameraError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadImage(file);
        console.log('갤러리 이미지 업로드 성공:', uploadedUrl);
        // 바로 UsePhotoPage로 이동
        navigate('/use-photo', {
          state: { image: uploadedUrl }
        });
      } catch (err: any) {
        showToast(`갤러리 이미지 업로드 실패: ${err.message}`, 'error');
        setIsUploading(false);
      }
    }
  };

  const startCameraStream = useCallback(async () => {
    setCameraError(null);
    try {
      setSelectedGalleryImage(null);
      setCapturedImage(null);

      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(newStream);
      setIsCameraActive(true);
      setCurrentImageIndex(0);
    } catch (err: any) {
      console.error('카메라 접근 에러:', err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setCameraError('카메라 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.');
      } else if (err instanceof DOMException && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError')) {
        setCameraError('카메라를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.');
      } else {
        setCameraError('카메라를 시작할 수 없습니다. 다시 시도해주세요: ' + err.message);
      }
      setIsCameraActive(false);
    }
  }, []);

  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setIsVideoReady(false);
  }, [stream]);

  const handleCameraClick = () => {
    if (isCameraActive) {
      stopCameraStream();
    } else {
      startCameraStream();
    }
  };

  const handleTakePhoto = async () => {
    if (!isVideoReady) {
      setCameraError('카메라 준비가 되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setCameraError('비디오 크기가 0입니다. 캡처를 중단합니다.');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/png');
        });

        if (!imageBlob) {
          console.error('캔버스에서 이미지 Blob 생성 실패.');
          return;
        }

        const photoFile = new File([imageBlob], `captured_photo_${Date.now()}.png`, { type: 'image/png' });

        setIsUploading(true);
        try {
          const uploadedUrl = await uploadImage(photoFile);
          stopCameraStream();
          setCameraError(null);
          console.log('촬영된 사진 업로드 성공:', uploadedUrl);
          // 바로 UsePhotoPage로 이동
          navigate('/use-photo', {
            state: { image: uploadedUrl }
          });
        } catch (err: any) {
          console.error('촬영된 사진 업로드 실패:', err);
          showToast(`사진 업로드 실패: ${err.message}`, 'error');
          setIsUploading(false);
        }
      }
    }
  };

  if (isUploading) {
    return (
      <div className="loading-page-container">
        <div className="loading-spinner">
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="make-card-page">
        <header className="detail-header">
          <button className="header-left-arrow" onClick={() => navigate("/reading-card")}>
            <span
              className="mgc_left_fill"
            ></span>
          </button>
          <h3>독서카드 만들기</h3>
          <div className="dummy-box" />
        </header>

        <div className="header-margin"></div>

        <div className="image-preview-card">
          {isCameraActive && stream ? (
            <video
              ref={videoRef}
              className="camera-feed"
              autoPlay
              playsInline
              muted
            />
          ) : cameraError ? (
            <div className="camera-error-message">
              <p>{cameraError}</p>
              <p>카메라 접근 권한을 확인하고 다시 시도해주세요.</p>
            </div>
          ) : imagesToDisplay.length > 0 && imagesToDisplay[currentImageIndex] ? (
            <img
              src={imagesToDisplay[currentImageIndex]}
              alt="카드 이미지"
              className="preview-image"
              onLoad={() => console.log('Image loaded:', imagesToDisplay[currentImageIndex])}
              onError={e => {
                e.currentTarget.src = 'https://placehold.co/350x500/cccccc/333333?text=Image+Load+Failed';
                e.currentTarget.alt = '이미지 로드 실패';
              }}
            />
          ) : (
            <div className="no-image-message">
              <p>표시할 이미지가 없습니다.</p>
              <p>갤러리에서 선택하거나 카메라로 촬영해주세요.</p>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {!isCameraActive && imagesToDisplay.length > 0 && (
          <div className="image-dots-container">
            {imagesToDisplay.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(idx)}
              />
            ))}
          </div>
        )}

        <div className="button-container">
          {isCameraActive ? (
            <button className="take-photo-button" onClick={handleTakePhoto} disabled={!isVideoReady || isUploading}>
              <span>{isUploading ? '업로드 중...' : '촬영'}</span>
            </button>
          ) : (
            <>
              <button className="gallery-button" onClick={handleGalleryClick} disabled={isUploading}>
                <img src={GalleryIcon} alt="갤러리 아이콘" className="button-icon" />
                <span>갤러리</span>
              </button>
              <button className="camera-button" onClick={handleCameraClick} disabled={isUploading}>
                <img src={CameraIcon} alt="카메라 아이콘" className="button-icon" />
                <span>카메라</span>
              </button>
            </>
          )}
        </div>



        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
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

export default MakeCardPage;
