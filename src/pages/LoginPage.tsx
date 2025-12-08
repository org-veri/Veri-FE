// src/pages/LoginPage.tsx

import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {handleSocialLoginCallback, setAccessToken} from '../api/auth';
import {USE_MOCK_DATA} from '../api/mock';
import kakaoIcon from '../assets/icons/login/kakao_icon.svg';
import veriLogo from '../assets/icons/union.svg';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const [bottomPadding, setBottomPadding] = useState(50);

  useEffect(() => {
    const calculateBottomPadding = () => {
      if (!buttonsContainerRef.current) return;

      const viewportHeight = window.innerHeight;
      const containerRect = buttonsContainerRef.current.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const containerTop = containerRect.top;

      // 버튼 컨테이너가 화면 하단에서 얼마나 떨어져 있는지 계산
      const distanceFromBottom = viewportHeight - (containerTop + containerHeight);

      // 최소 여백을 보장하면서 버튼이 잘리지 않도록 조정
      const minSafeMargin = 20; // 최소 안전 여백
      const desiredPadding = Math.max(minSafeMargin, distanceFromBottom + minSafeMargin);

      setBottomPadding(desiredPadding);
    };

    // 초기 계산
    calculateBottomPadding();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', calculateBottomPadding);
    window.addEventListener('orientationchange', calculateBottomPadding);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener('resize', calculateBottomPadding);
      window.removeEventListener('orientationchange', calculateBottomPadding);
    };
  }, []);

  const handleKakaoLogin = async () => {
    if (USE_MOCK_DATA) {
      try {
        console.log('목업 모드: 카카오 로그인 시뮬레이션');
        const accessToken = await handleSocialLoginCallback('kakao', 'mock-code', 'mock-state');
        setAccessToken(accessToken);
        navigate('/');
      } catch (error) {
        console.error('목업 로그인 실패:', error);
        alert(`로그인 처리 중 오류가 발생했습니다.\n\n${(error as Error).message}`);
      }
    } else {
      const kakaoAuthUrl = `${BASE_URL}/oauth2/authorization/kakao`;
      console.log('Redirecting to backend for Kakao login:', kakaoAuthUrl);
      window.location.href = kakaoAuthUrl;
    }
  };


  return (
    <div className="page-container">
      <div className="login-content-wrapper">
        <div className="login-logo-container">
          <p className="login-tagline">나만의 문장을 수확하다,</p>
          <img src={veriLogo} alt="VERi Logo" className="login-logo" />
        </div>
        <div 
          className="login-buttons-container"
          ref={buttonsContainerRef}
          style={{paddingBottom: `${bottomPadding}px`}}
        >
          <button className="social-login-button kakao" onClick={handleKakaoLogin}>
            <img src={kakaoIcon} alt="kakao-logo" className="kakao-social-icon" />
            <span className="kakao-social-text">카카오 로그인</span>
          </button>

          {/* <button className="social-login-button naver" onClick={handleNaverLogin}>
            <img src={naverIcon} alt="naver-logo" className="naver-social-icon" />
            <span className="naver-social-text">네이버 로그인</span>
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
