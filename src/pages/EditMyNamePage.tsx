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
            if (file.size > 5 * 1024 * 1024) {
                showToast('이미지 크기는 5MB 이하여야 합니다.', 'warning');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showToast('이미지 파일만 업로드 가능합니다.', 'warning');
                return;
            }

            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            setIsUploadingImage(true);
            try {
                const uploadedUrl = await uploadImage(file);
                setUploadedImageUrl(uploadedUrl);
                URL.revokeObjectURL(url);
                setPreviewUrl(uploadedUrl);
                showToast('이미지가 업로드되었습니다.', 'success');
            } catch (error: any) {
                console.error('이미지 업로드 실패:', error);
                showToast('이미지 업로드에 실패했습니다.', 'error');
                URL.revokeObjectURL(url);
                setPreviewUrl(null);
                setUploadedImageUrl(null);
            } finally {
                setIsUploadingImage(false);
            }
        }
    };

    const handleNicknameBlur = async () => {
        const trimmedNickname = nickname.trim();
        
        if (!trimmedNickname || trimmedNickname === originalNickname) {
            return;
        }

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
        } finally {
            setIsCheckingNickname(false);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedNickname = nickname.trim();

        if (!trimmedNickname) {
            showToast('닉네임을 입력해주세요.', 'warning');
            return;
        }

        if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
            showToast('닉네임은 2자 이상 20자 이하여야 합니다.', 'warning');
            return;
        }

        const isNicknameChanged = trimmedNickname !== originalNickname;
        const isImageChanged = uploadedImageUrl !== null;
        
        if (!isNicknameChanged && !isImageChanged) {
            showToast('변경된 내용이 없습니다.', 'info');
            return;
        }

        if (isImageChanged && !uploadedImageUrl && isUploadingImage) {
            showToast('이미지 업로드 중입니다. 잠시만 기다려주세요.', 'info');
            return;
        }

        setIsLoading(true);

        try {
            let finalImageUrl: string | null = null;

            if (uploadedImageUrl) {
                finalImageUrl = uploadedImageUrl;
            } else if (previewUrl) {
                finalImageUrl = previewUrl;
            }

            if (!finalImageUrl) {
                showToast('프로필 이미지를 선택해주세요.', 'warning');
                setIsLoading(false);
                return;
            }

            const updateData: {
                nickname: string;
                profileImageUrl: string;
            } = {
                nickname: trimmedNickname,
                profileImageUrl: finalImageUrl
            };

            const response = await updateMemberInfo(updateData);

            if (response.isSuccess) {
                if (response.result) {
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
