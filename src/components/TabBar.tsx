import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TabBar.css';

interface TabItem {
    id: string;
    name: string;
    iconClass: string;
    path: string;
    isDummy?: boolean;
}

const currentTabs: TabItem[] = [
    { id: 'home', name: '홈', iconClass: 'mgc_home_4_line', path: '/' },
    { id: 'library', name: '책장', iconClass: 'mgc_book_3_fill', path: '/library' },
    { id: 'camera', name: '', iconClass: '', path: '', isDummy: true },
    { id: 'readingCard', name: '독서카드', iconClass: 'mgc_notebook_2_fill', path: '/reading-card' },
    { id: 'community', name: '커뮤니티', iconClass: 'mgc_book_5_fill', path: '/community' },
];

function TabBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const initialActiveTabId = currentTabs.find(tab => tab.path === location.pathname)?.id ?? 'home';
    const [activeTab, setActiveTab] = useState<string>(initialActiveTabId);

    useEffect(() => {
        const currentTab = currentTabs.find(tab => tab.path === location.pathname);
        if (currentTab) {
            setActiveTab(currentTab.id);
        }
    }, [location.pathname]);

    const handleTabClick = (tab: TabItem) => {
        if (tab.isDummy) {
            return;
        }
        setActiveTab(tab.id);
        navigate(tab.path);
    };

    return (
        <div className="tab-bar-container">
            {currentTabs.map((tab) => {
                const isActive = activeTab === tab.id || location.pathname === tab.path;

                return (
                    <div
                        key={tab.id}
                        className={`${tab.isDummy ? 'dummy-tab-item' : 'tab-item'} ${isActive ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab)}
                    >
                        {!tab.isDummy && (
                            <>
                                <span className={`tab-item-icon ${tab.iconClass}`} aria-hidden />
                                <span className='tab-item-text'>{tab.name}</span>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default TabBar;
