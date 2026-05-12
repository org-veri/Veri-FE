import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PATH } from '../config/routes';
import './TabBar.css';

interface TabItem {
  id: string;
  name: string;
  iconClass: string;
  path: string;
  isCenterCamera?: boolean;
}

const currentTabs: TabItem[] = [
  { id: 'home', name: '홈', iconClass: 'mgc_home_4_fill', path: PATH.HOME },
  { id: 'library', name: '책장', iconClass: 'mgc_book_3_fill', path: PATH.LIBRARY },
  { id: 'camera', name: '', iconClass: 'mgc_camera_fill', path: PATH.MAKE_CARD, isCenterCamera: true },
  { id: 'readingCard', name: '독서카드', iconClass: 'mgc_notebook_2_fill', path: PATH.READING_CARD },
  { id: 'community', name: '커뮤니티', iconClass: 'mgc_book_5_fill', path: PATH.COMMUNITY },
];

function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialActiveTabId =
    currentTabs.find((tab) => tab.path === location.pathname && !tab.isCenterCamera)?.id ?? 'home';
  const [activeTab, setActiveTab] = useState<string>(initialActiveTabId);

  useEffect(() => {
    const onMakeCard = location.pathname === PATH.MAKE_CARD;
    if (onMakeCard) {
      setActiveTab('camera');
      return;
    }
    const currentTab = currentTabs.find(
      (tab) => !tab.isCenterCamera && tab.path === location.pathname
    );
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [location.pathname]);

  const handleTabClick = (tab: TabItem) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  return (
    <nav className="tab-bar-container" aria-label="하단 메뉴">
      {currentTabs.map((tab) => {
        if (tab.isCenterCamera) {
          const onMakeCard = location.pathname === PATH.MAKE_CARD;
          return (
            <button
              key={tab.id}
              type="button"
              className="tab-bar-camera"
              aria-label="촬영"
              aria-current={onMakeCard ? 'page' : undefined}
              onClick={() => handleTabClick(tab)}
            >
              <span className="tab-bar-camera-inner">
                <span className={`tab-item-icon tab-bar-camera-icon ${tab.iconClass}`} aria-hidden />
              </span>
            </button>
          );
        }

        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={`tab-item${isActive ? ' active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => handleTabClick(tab)}
          >
            <span className={`tab-item-icon ${tab.iconClass}`} aria-hidden />
            <span className="tab-item-text">{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default TabBar;
