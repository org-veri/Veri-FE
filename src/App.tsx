import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import TabBar from './components/TabBar';
<<<<<<< HEAD
=======
import MainLayout from './components/MainLayout';
import Sidebar from './components/Sidebar';
>>>>>>> 1adf8f743cfb03f7aa00a1dfe599c07ea629d9da
import FloatingCameraButton from './components/FloatingCameraButton';
import { PATH, PATHS_PUBLIC, shouldShowTabBar, shouldShowSidebar, shouldShowFloatingCamera } from './config/routes';
import { getAccessTokenAsync } from './api/auth';
import './App.css';

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

<<<<<<< HEAD
const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

=======
>>>>>>> 1adf8f743cfb03f7aa00a1dfe599c07ea629d9da
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const authCheckRef = useRef(false);
  useEffect(() => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;

    const checkAuthOnMount = async () => {
      try {
        const token = await getAccessTokenAsync(true);
        if (token) {
          if (location.pathname === PATH.LOGIN) {
            navigate(PATH.HOME, { replace: true });
          }
        } else {
          if (!PATHS_PUBLIC.includes(location.pathname)) {
            navigate(PATH.LOGIN, { replace: true });
          }
        }
      } catch {
        if (!PATHS_PUBLIC.includes(location.pathname)) {
          navigate(PATH.LOGIN, { replace: true });
        }
      } finally {
        setIsInitialCheckDone(true);
      }
    };

    checkAuthOnMount();
  }, []);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

<<<<<<< HEAD
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

=======
  const showTabBar = shouldShowTabBar(location.pathname);
  const showFloatingCameraButton = shouldShowFloatingCamera(location.pathname);
  const showSidebar = shouldShowSidebar(location.pathname);
  const isPublicPage = PATHS_PUBLIC.includes(location.pathname);
  if (!isInitialCheckDone && !isPublicPage) {
    return (
      <div className="loading-page-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
>>>>>>> 1adf8f743cfb03f7aa00a1dfe599c07ea629d9da

  return (
    <div className="App">
      <Routes>
<<<<<<< HEAD
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
=======
        <Route path={PATH.LOGIN} element={<LoginPage />} />
        <Route path={PATH.OAUTH_CALLBACK} element={<OAuthCallbackPage />} />
        <Route path={PATH.HOME} element={<MainLayout><HomePage /></MainLayout>} />
        <Route path={PATH.READING_CARD} element={<MainLayout><ReadingCardPage /></MainLayout>} />
        <Route path={PATH.COMMUNITY} element={<MainLayout><CommunityPage /></MainLayout>} />
        <Route path={PATH.BOOKMARK} element={<MainLayout><BookmarkPage /></MainLayout>} />
        <Route path={PATH.MY_PAGE} element={<MainLayout><MyPage /></MainLayout>} />
        <Route path={PATH.LIBRARY} element={<MainLayout><LibraryPage /></MainLayout>} />
        <Route path={`${PATH.BOOK_DETAIL}/:id`} element={<MainLayout><BookDetailPage /></MainLayout>} />
        <Route path={`${PATH.READING_CARD_DETAIL}/:id`} element={<MainLayout><ReadingCardDetailPage /></MainLayout>} />
        <Route path={`${PATH.COMMUNITY_POST}/:postId`} element={<MainLayout><CommunityPostDetailPage /></MainLayout>} />
        <Route path={`${PATH.MY_COMMUNITY_POST}/:postId`} element={<MainLayout><MyCommunityPostDetailPage /></MainLayout>} />
        <Route path={PATH.MAKE_CARD} element={<MainLayout><MakeCardPage /></MainLayout>} />
        <Route path={PATH.TEXT_EXTRACTION_LOADING} element={<MainLayout><TextExtractionLoadingPage /></MainLayout>} />
        <Route path={PATH.TEXT_EXTRACTION_RESULT} element={<MainLayout><TextExtractionResultPage /></MainLayout>} />
        <Route path={PATH.CUSTOMIZE_CARD} element={<MainLayout><CardCustomizationPage /></MainLayout>} />
        <Route path={PATH.CARD_COMPLETE} element={<MainLayout><CardCustomizationCompletePage /></MainLayout>} />
        <Route path={PATH.BOOK_SEARCH} element={<MainLayout><BookSearchPage /></MainLayout>} />
        <Route path={PATH.DOWNLOAD_CARD} element={<MainLayout><DownloadCardPage /></MainLayout>} />
        <Route path={PATH.BOOK_ADD} element={<MainLayout><BookAddPage /></MainLayout>} />
        <Route path={PATH.CARD_BOOK_SEARCH} element={<MainLayout><CardBookSearchPage /></MainLayout>} />
        <Route path={PATH.CARD_BOOK_SEARCH_BEFORE} element={<MainLayout><CardBookSearchBeforePage /></MainLayout>} />
        <Route path={PATH.USE_PHOTO} element={<MainLayout><UsePhotoPage /></MainLayout>} />
        <Route path={PATH.EDIT_MY_NAME} element={<MainLayout><EditMyNamePage /></MainLayout>} />
        <Route path={PATH.WRITE_POST} element={<MainLayout><WritePostPage /></MainLayout>} />
        <Route path={PATH.POST_BOOK_SEARCH} element={<MainLayout><PostBookSearchPage /></MainLayout>} />
        <Route path={PATH.COMMUNITY_READING_CARDS} element={<MainLayout><CommunityMoreReadingCardPage /></MainLayout>} />
>>>>>>> 1adf8f743cfb03f7aa00a1dfe599c07ea629d9da
        <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}><h2>404 - Page Not Found</h2></div>} />
      </Routes>
      {showTabBar && <TabBar />}
      {showFloatingCameraButton && <FloatingCameraButton />}
    </div>
  );
}

export default App;