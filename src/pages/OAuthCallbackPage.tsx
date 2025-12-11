// src/pages/OAuthCallbackPage.tsx

import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleSocialLoginCallback, setAccessToken, setRefreshToken } from '../api/auth';
import { USE_MOCK_DATA } from '../api/mock';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false); // Prevent double execution

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const processKakaoCallback = async () => {
      if (USE_MOCK_DATA) {
        // 목업 모드에서는 콜백 페이지를 거치지 않으므로 바로 홈으로 이동
        navigate('/');
        return;
      }

      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state') || '';

      if (code) {
        try {
          const { accessToken, refreshToken } = await handleSocialLoginCallback('kakao', code, state);
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          navigate('/');
        } catch (error) {
          console.error('로그인 실패:', error);
          alert(`로그인 처리 중 오류가 발생했습니다.\n\n${(error as Error).message}`);
          navigate('/login');
        }
      } else {
        console.error('인가 코드를 찾을 수 없습니다.');
        alert('인가 코드가 유효하지 않습니다. 다시 시도해주세요.');
        navigate('/login');
      }
    };

    processKakaoCallback();
  }, [location, navigate]);

  return (
    <div className="loading-page-container">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default OAuthCallbackPage;
