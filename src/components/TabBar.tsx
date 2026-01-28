// src/components/TabBar.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// SVG 아이콘들을 import합니다.
import LibraryActiveIcon from '../assets/icons/NavBar/Active/library.svg';
import LibraryDeactiveIcon from '../assets/icons/NavBar/Deactive/library.svg';
import ReadingCardActiveIcon from '../assets/icons/NavBar/Active/reading_card.svg';
import ReadingCardDeactiveIcon from '../assets/icons/NavBar/Deactive/reading_card.svg';
import CommunityActiveIcon from '../assets/icons/NavBar/Active/community.svg';
import CommunityDeactiveIcon from '../assets/icons/NavBar/Deactive/community.svg';
import HomeActiveIcon from '../assets/icons/NavBar/Active/home.svg';
import HomeDeactiveIcon from '../assets/icons/NavBar/Deactive/home.svg';

const LibraryIcon = ({ active }: { active: boolean }) => (
    <img 
        src={active ? LibraryActiveIcon : LibraryDeactiveIcon} 
        alt="서재" 
        className="tab-item-icon"
    />
);

const ReadingCardIcon = ({ active }: { active: boolean }) => (
    <img 
        src={active ? ReadingCardActiveIcon : ReadingCardDeactiveIcon} 
        alt="독서카드" 
        className="tab-item-icon"
    />
);

const CommunityIcon = ({ active }: { active: boolean }) => (
    <img 
        src={active ? CommunityActiveIcon : CommunityDeactiveIcon} 
        alt="커뮤니티" 
        className="tab-item-icon"
    />
);

// const MyPageIcon = ({ active }: { active: boolean }) => (
//     <img 
//         src={active ? MyPageActiveIcon : MyPageDeactiveIcon} 
//         alt="마이페이지" 
//         className="tab-item-icon"
//     />
// );

const HomeIcon = ({ active }: { active: boolean }) => (
    <img 
        src={active ? HomeActiveIcon : HomeDeactiveIcon} 
        alt="홈" 
        className="tab-item-icon"
    />
);

interface TabItem {
    id: string;
    name: string;
    icon: React.ComponentType<{ active: boolean }>;
    path: string;
    isDummy?: boolean;
}

const currentTabs: TabItem[] = [
    { id: 'home', name: '홈', icon: HomeIcon, path: '/' },
    { id: 'library', name: '책장', icon: LibraryIcon, path: '/library' },
    { id: 'camera', name: '', icon: () => null, path: '', isDummy: true },
    { id: 'readingCard', name: '독서카드', icon: ReadingCardIcon, path: '/reading-card' },
    { id: 'community', name: '커뮤니티', icon: CommunityIcon, path: '/community' },
];

function TabBar() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const currentTab = currentTabs.find(tab => tab.path === location.pathname);
        if (currentTab) {
            setActiveTab(currentTab.id);
        } else {
        }
    }, [location.pathname]);

    const initialActiveTabId = currentTabs.find(tab => tab.path === location.pathname)?.id ?? 'home';
    const [activeTab, setActiveTab] = useState<string>(initialActiveTabId);


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
                const IconComponent = tab.icon;

                return (
                    <div
                        key={tab.id}
                        className={`${tab.isDummy ? 'dummy-tab-item' : 'tab-item'} ${isActive ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab)}
                    >
                        {!tab.isDummy && (
                            <>
                                <IconComponent active={isActive} />
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