import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditMyNamePage.css';
import { getMemberProfile, updateMemberInfo, checkNicknameExists } from '../api/memberApi';
import { uploadImage } from '../api/imageApi';
import Toast from '../components/Toast';

const EditMyNamePage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [nickname, setNickname] = useState('');
    const [originalNickname, setOriginalNickname] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingNickname, setIsCheckingNickname] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    // 현재 사용자 정보 로드
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const response = await getMemberProfile();
                if (response.isSuccess && response.result) {
                    setNickname(response.result.nickname);
                    setOriginalNickname(response.result.nickname);
                    if (response.result.image) {
                        setPreviewUrl(response.result.image);
                    }
                }
            } catch (error) {
                showToast('프로필 정보를 불러오는데 실패했습니다.', 'error');
            }
        };
        loadUserProfile();
    }, []);

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const onBack = () => navigate(-1);

    const openFilePicker = () => fileInputRef.current?.click();
    
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 파일 크기 제한 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('이미지 크기는 5MB 이하여야 합니다.', 'warning');
                return;
            }

            // 파일 타입 확인
            if (!file.type.startsWith('image/')) {
                showToast('이미지 파일만 업로드 가능합니다.', 'warning');
                return;
            }

            // 미리보기용 URL 생성
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            // 즉시 업로드 시작
            setIsUploadingImage(true);
            try {
                const uploadedUrl = await uploadImage(file);
                setUploadedImageUrl(uploadedUrl);
                // 업로드 완료 후 미리보기 URL을 업로드된 URL로 교체
                URL.revokeObjectURL(url);
                setPreviewUrl(uploadedUrl);
                showToast('이미지가 업로드되었습니다.', 'success');
            } catch (error: any) {
                console.error('이미지 업로드 실패:', error);
                showToast('이미지 업로드에 실패했습니다.', 'error');
                // 업로드 실패 시 미리보기도 제거
                URL.revokeObjectURL(url);
                setPreviewUrl(null);
                setUploadedImageUrl(null);
            } finally {
                setIsUploadingImage(false);
            }
        }
    };

    // 닉네임 중복 확인
    const handleNicknameBlur = async () => {
        const trimmedNickname = nickname.trim();
        
        // 빈 값이거나 원래 닉네임과 같으면 중복 확인 안 함
        if (!trimmedNickname || trimmedNickname === originalNickname) {
            return;
        }

        // 닉네임 길이 확인
        if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
            showToast('닉네임은 2자 이상 20자 이하여야 합니다.', 'warning');
            return;
        }

        setIsCheckingNickname(true);
        try {
            const response = await checkNicknameExists(trimmedNickname);
            if (response.isSuccess && response.result) {
                showToast('이미 사용 중인 닉네임입니다.', 'warning');
                setNickname(originalNickname);
            }
        } catch (error) {
            // 중복 확인 실패해도 계속 진행 가능
        } finally {
            setIsCheckingNickname(false);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedNickname = nickname.trim();

        // 닉네임 유효성 검사
        if (!trimmedNickname) {
            showToast('닉네임을 입력해주세요.', 'warning');
            return;
        }

        if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
            showToast('닉네임은 2자 이상 20자 이하여야 합니다.', 'warning');
            return;
        }

        // 변경 사항 확인: 닉네임과 이미지 모두 변경되지 않았으면 API 호출하지 않음
        const isNicknameChanged = trimmedNickname !== originalNickname;
        const isImageChanged = uploadedImageUrl !== null;
        
        if (!isNicknameChanged && !isImageChanged) {
            showToast('변경된 내용이 없습니다.', 'info');
            return;
        }

        // 이미지가 선택되었지만 아직 업로드 중인 경우
        if (isImageChanged && !uploadedImageUrl && isUploadingImage) {
            showToast('이미지 업로드 중입니다. 잠시만 기다려주세요.', 'info');
            return;
        }

        setIsLoading(true);

        try {
            // 최종 보낼 이미지 URL (필수)
            let finalImageUrl: string | null = null;

            // 업로드된 이미지 URL이 있으면 사용, 없으면 기존 이미지 URL 사용
            if (uploadedImageUrl) {
                finalImageUrl = uploadedImageUrl;
            } else if (previewUrl) {
                // 파일을 새로 선택하지 않은 경우 기존 이미지 URL 사용
                finalImageUrl = previewUrl;
            }

            // 서버 요구사항: 이미지가 반드시 함께 전달되어야 함
            if (!finalImageUrl) {
                showToast('프로필 이미지를 선택해주세요.', 'warning');
                setIsLoading(false);
                return;
            }

            // 업데이트할 데이터 준비 - 항상 두 필드를 함께 보냄
            const updateData: {
                nickname: string;
                profileImageUrl: string;
            } = {
                nickname: trimmedNickname,
                profileImageUrl: finalImageUrl
            };

            // 정보 업데이트
            const response = await updateMemberInfo(updateData);

            if (response.isSuccess) {
                // 응답 결과 확인
                if (response.result) {
                    // 닉네임이 null로 반환되는 경우 경고
                    if (response.result.nickname === null && trimmedNickname) {
                        showToast('이미지는 업데이트되었지만 닉네임 업데이트에 문제가 있을 수 있습니다.', 'warning');
                    } else if (response.result.nickname === trimmedNickname) {
                        showToast('프로필이 성공적으로 수정되었습니다.', 'success');
                    } else {
                        showToast('프로필이 수정되었습니다.', 'success');
                    }
                } else {
                    showToast('프로필이 성공적으로 수정되었습니다.', 'success');
                }
                
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } else {
                showToast(response.message || '프로필 수정에 실패했습니다.', 'error');
            }
        } catch (error: any) {
            showToast(error.message || '프로필 수정 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container edit-profile-page">
            <div className="edit-header">
                <button className="header-left-arrow" onClick={onBack} aria-label="뒤로가기">
                    <span className="mgc_left_fill"></span>
                </button>
                <h3>프로필 수정하기</h3>
                <div className="dummy-box"></div>
            </div>

            <form id="edit-profile-form" className="edit-form" onSubmit={onSubmit}>
                <div className="avatar-uploader" onClick={openFilePicker}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="미리보기" />
                    ) : (
                        <div className="avatar-placeholder"></div>
                    )}
                    <div className="camera-chip">
                        <span className="mgc_camera_fill"></span>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} hidden />
                </div>

                <div className="nickname-input-container">
                    <label className="input-label" htmlFor="nickname">닉네임</label>
                    <input
                        id="nickname"
                        className="text-input"
                        type="text"
                        placeholder="닉네임을 입력하세요"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        onBlur={handleNicknameBlur}
                        disabled={isCheckingNickname || isLoading}
                        maxLength={20}
                    />
                </div>
            </form>

            <div className="bottom-actions">
                    <button 
                    type="submit" 
                    form="edit-profile-form" 
                    className="save-button"
                    disabled={isLoading || isCheckingNickname || isUploadingImage}
                >
                    {isLoading ? '저장 중...' : isUploadingImage ? '이미지 업로드 중...' : '저장하기'}
                </button>
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

export default EditMyNamePage;
