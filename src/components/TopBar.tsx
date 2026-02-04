import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';
import profileIcon from '../assets/icons/TopBar/profile.svg';
import unionIcon from '../assets/icons/TopBar/union_fill.svg';
import { getMemberProfile } from '../api/memberApi';

interface TopBarProps {
  showProfile?: boolean;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  showProfile = true,
  onSearchClick,
  onNotificationClick,
  onProfileClick
}) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    // localStorage에서 프로필 이미지 가져오기
    const storedImage = localStorage.getItem('profileImage');
    return storedImage || null;
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMemberProfile();
        if (response.isSuccess && response.result?.image) {
          const imageUrl = response.result.image;
          setProfileImage(imageUrl);
          // localStorage에 프로필 이미지 저장
          localStorage.setItem('profileImage', imageUrl);
        } else {
          localStorage.removeItem('profileImage');
          setProfileImage(null);
        }
      } catch (error) {
        console.error('프로필 이미지 로드 실패:', error);
      }
    };

    if (showProfile) {
      // localStorage에 이미지가 없을 때만 API 호출
      if (!localStorage.getItem('profileImage')) {
        fetchProfile();
      }
    }
  }, [showProfile]);

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate('/book-search');
    }
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      navigate('/my-page');
    }
  };

  return (
    <header className="hero-header">
      <button 
        type="button" 
        className="main-icon" 
        onClick={() => navigate('/')}
        aria-label="홈으로 이동"
      >
        <img src={unionIcon} alt="홈" />
      </button>
      <div className="header-icons">
        <button 
          type="button" 
          className="search-button" 
          aria-label="검색" 
          onClick={handleSearchClick}
        >
          <span className="mgc_search_2_fill"></span>
        </button>
        <button 
          type="button" 
          className="notification-button" 
          aria-label="알림"
          onClick={handleNotificationClick}
        >
          <span className="mgc_notification_fill"></span>
        </button>
        {showProfile && (
          <button
            type="button"
            className="my-page-button"
            aria-label="프로필 보기"
            onClick={handleProfileClick}
          >
            {profileImage ? (
              <img src={profileImage} alt="프로필" className="top-bar-profile-image" />
            ) : (
              <img src={profileIcon} alt="프로필" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
