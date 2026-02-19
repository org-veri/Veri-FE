import React, {useEffect, useRef, useState} from 'react';
import kakaoIcon from '../assets/icons/login/kakao_icon.svg';
import veriLogo from '../assets/icons/union.svg';
import './LoginPage.css';

const LoginPage: React.FC = () => {
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
      const distanceFromBottom = viewportHeight - (containerTop + containerHeight);
      const minSafeMargin = 20;
      const desiredPadding = Math.max(minSafeMargin, distanceFromBottom + minSafeMargin);

      setBottomPadding(desiredPadding);
    };

    calculateBottomPadding();

    window.addEventListener('resize', calculateBottomPadding);
    window.addEventListener('orientationchange', calculateBottomPadding);

    return () => {
      window.removeEventListener('resize', calculateBottomPadding);
      window.removeEventListener('orientationchange', calculateBottomPadding);
    };
  }, []);

  const handleKakaoLogin = async () => {
    const kakaoAuthUrl = `${BASE_URL}/oauth2/authorization/kakao`;
    console.log('Redirecting to backend for Kakao login:', kakaoAuthUrl);
    window.location.href = kakaoAuthUrl;
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
          style={{ paddingBottom: `${bottomPadding}px` }}
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
