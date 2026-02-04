import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import TabBar from './components/TabBar';
import MainLayout from './components/MainLayout';
import Sidebar from './components/Sidebar';
import FloatingCameraButton from './components/FloatingCameraButton';
import { PATH, PATHS_PUBLIC, shouldShowTabBar, shouldShowSidebar, shouldShowFloatingCamera } from './config/routes';
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

const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() && !PATHS_PUBLIC.includes(location.pathname)) {
      navigate(PATH.LOGIN);
    }
    window.scrollTo(0, 0);
  }, [location.pathname, navigate]);

  const showTabBar = shouldShowTabBar(location.pathname);
  const showFloatingCameraButton = shouldShowFloatingCamera(location.pathname);
  const showSidebar = shouldShowSidebar(location.pathname);

  return (
    <div className={`App ${showSidebar ? 'has-sidebar' : ''}`}>
      {showSidebar && <Sidebar />}
      <Routes>
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
        <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}><h2>404 - Page Not Found</h2></div>} />
      </Routes>
      {showTabBar && <TabBar />}
      {showFloatingCameraButton && <FloatingCameraButton />}
    </div>
  );
}

export default App;