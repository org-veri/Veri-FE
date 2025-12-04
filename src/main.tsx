// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // BrowserRouter 임포트
import { HelmetProvider } from 'react-helmet-async';
import 'mingcute_icon/font/Mingcute.css'
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter> {/* App 컴포넌트를 BrowserRouter로 감싸줍니다 */}
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);