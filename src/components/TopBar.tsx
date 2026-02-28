import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [profileImage, setProfileImage] = useState<string | null>(() => {
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
      if (!localStorage.getItem('profileImage')) {
        fetchProfile();
      }
    }
  }, [showProfile]);

  // 프로필 수정 후 반영: 커스텀 이벤트 수신
  useEffect(() => {
    const onProfileUpdated = (e: Event) => {
      const url = (e as CustomEvent<{ profileImageUrl: string }>).detail?.profileImageUrl;
      if (url) {
        setProfileImage(url);
      }
    };
    window.addEventListener('profileUpdated', onProfileUpdated);
    return () => window.removeEventListener('profileUpdated', onProfileUpdated);
  }, []);
  
  const prevPathRef = React.useRef(location.pathname);
  useEffect(() => {
    if (!showProfile) return;
    const prevPath = prevPathRef.current;
    prevPathRef.current = location.pathname;
    if (prevPath === '/edit-my-name' && location.pathname !== '/edit-my-name') {
      getMemberProfile().then((response) => {
        if (response.isSuccess && response.result?.image) {
          const imageUrl = response.result.image;
          setProfileImage(imageUrl);
          localStorage.setItem('profileImage', imageUrl);
        }
      }).catch(() => {});
    }
  }, [location.pathname, showProfile]);

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
