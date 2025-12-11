// src/App.tsx

import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import TabBar from './components/TabBar';
import Sidebar from './components/Sidebar';
import FloatingCameraButton from './components/FloatingCameraButton';
import './App.css';

// Import page components
import HomePage from './pages/mainPage/Home';
import ReadingCardPage from './pages/mainPage/ReadingCardPage';
import CommunityPage from './pages/mainPage/CommunityPage';
import BookmarkPage from './pages/bookmarkPage';
import MyPage from './pages/MyPage';
import LibraryPage from './pages/mainPage/LibraryPage';
import BookDetailPage from './pages/detailPage/BookDetailPage';
import ReadingCardDetailPage from './pages/detailPage/ReadingCardDetailPage';
import CommunityPostDetailPage from './pages/detailPage/CommunityPostDetailPage';
import MyCommunityPostDetailPage from './pages/MyCommunityPostDetailPage';
import LoginPage from './pages/LoginPage';
import MakeCardPage from './pages/makeCardPage/MakeCardPage';
import TextExtractionLoadingPage from './pages/makeCardPage/TextExtractionLoadingPage';
import TextExtractionResultPage from './pages/makeCardPage/TextExtractionResultPage';
import CardCustomizationPage from './pages/makeCardPage/CardCustomizationPage';
import CardCustomizationCompletePage from './pages/makeCardPage/CardCustomizationCompletePage';
import BookSearchPage from './pages/BookSearchPage';
import DownloadCardPage from './pages/DownloadCardPage';
import BookAddPage from './pages/BookAddPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import CardBookSearchPage from './pages/makeCardPage/CardBookSearchPage';
import CardBookSearchBeforePage from './pages/makeCardPage/CardBookSearchBeforePage';
import UsePhotoPage from './pages/makeCardPage/UsePhotoPage';
import EditMyNamePage from './pages/EditMyNamePage';
import WritePostPage from './pages/WritePostPage/WritePostPage';
import PostBookSearchPage from './pages/WritePostPage/PostBookSearchPage';
import CommunityMoreReadingCardPage from './pages/CommunityMoreReadingCardPage';

// 인증 상태를 확인하는 헬퍼 함수 (로직은 그대로 유지)
const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const publicPaths = ['/login', '/oauth/callback/kakao'];

    if (!isAuthenticated() && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }

    window.scrollTo(0, 0);
  }, [location.pathname, navigate]);

  const showTabBar = [
    '/',
    '/library',
    '/reading-card',
    '/community',
    '/my-page'
  ].includes(location.pathname);

  const showFloatingCameraButton = showTabBar && ![
    '/make-card',
    '/text-extraction-loading',
    '/text-extraction-result',
    '/customize-card',
    '/card-complete',
    '/book-search',
    '/book-add',
    '/download-card'
  ].includes(location.pathname);


  const showSidebar = ![
    '/login',
    '/oauth/callback/kakao'
  ].includes(location.pathname);

  return (
    <div className={`App ${showSidebar ? 'has-sidebar' : ''}`}>
      {showSidebar && <Sidebar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/reading-card" element={<ReadingCardPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/bookmark" element={<BookmarkPage />} />
        <Route path="/my-page" element={<MyPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/book-detail/:id" element={<BookDetailPage />} />
        <Route path="/reading-card-detail/:id" element={<ReadingCardDetailPage />} />
        <Route path="/community/post/:postId" element={<CommunityPostDetailPage />} />
        <Route path="/my-community/post/:postId" element={<MyCommunityPostDetailPage />} />
        <Route path="/make-card" element={<MakeCardPage />} />
        <Route path="/text-extraction-loading" element={<TextExtractionLoadingPage />} />
        <Route path="/text-extraction-result" element={<TextExtractionResultPage />} />
        <Route path="/customize-card" element={<CardCustomizationPage />} />
        <Route path="/card-complete" element={<CardCustomizationCompletePage />} />
        <Route path="/book-search" element={<BookSearchPage />} />
        <Route path="/download-card" element={<DownloadCardPage />} />
        <Route path="/book-add" element={<BookAddPage />} />
        <Route path="/oauth/callback/kakao" element={<OAuthCallbackPage />} />
        <Route path="/card-book-search" element={<CardBookSearchPage />} />
        <Route path="/card-book-search-before" element={<CardBookSearchBeforePage />} />
        <Route path="/use-photo" element={<UsePhotoPage />} />
        <Route path="/edit-my-name" element={<EditMyNamePage />} />
        <Route path="/write-post" element={<WritePostPage />} />
        <Route path="/post-book-search" element={<PostBookSearchPage />} />
        <Route path="/community/reading-cards" element={<CommunityMoreReadingCardPage />} />
        {/* 404 페이지 */}
        <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}><h2>404 - Page Not Found</h2></div>} />
      </Routes>
      {showTabBar && <TabBar />}
      {showFloatingCameraButton && <FloatingCameraButton />}
    </div>
  );
}

export default App;