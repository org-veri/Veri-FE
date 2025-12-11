import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

// Import icons
import LibraryActiveIcon from '../assets/icons/NavBar/Active/library.svg';
import LibraryDeactiveIcon from '../assets/icons/NavBar/Deactive/library.svg';
import ReadingCardActiveIcon from '../assets/icons/NavBar/Active/reading_card.svg';
import ReadingCardDeactiveIcon from '../assets/icons/NavBar/Deactive/reading_card.svg';
import CommunityActiveIcon from '../assets/icons/NavBar/Active/community.svg';
import CommunityDeactiveIcon from '../assets/icons/NavBar/Deactive/community.svg';
import HomeActiveIcon from '../assets/icons/NavBar/Active/home.svg';
import HomeDeactiveIcon from '../assets/icons/NavBar/Deactive/home.svg';
import CameraIcon from '../assets/icons/camera.svg';
import UnionLogo from '../assets/icons/union.svg';

interface TabItem {
    id: string;
    name: string;
    icon: string;
    activeIcon: string;
    path: string;
    className?: string;
}

const sidebarTabs: TabItem[] = [
    { id: 'home', name: '홈', icon: HomeDeactiveIcon, activeIcon: HomeActiveIcon, path: '/' },
    { id: 'library', name: '책장', icon: LibraryDeactiveIcon, activeIcon: LibraryActiveIcon, path: '/library' },
    { id: 'readingCard', name: '독서카드', icon: ReadingCardDeactiveIcon, activeIcon: ReadingCardActiveIcon, path: '/reading-card' },
    { id: 'community', name: '커뮤니티', icon: CommunityDeactiveIcon, activeIcon: CommunityActiveIcon, path: '/community' },
    { id: 'makeCard', name: '촬영', icon: CameraIcon, activeIcon: CameraIcon, path: '/make-card', className: 'sidebar-make-card-btn' },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<string>('home');

    useEffect(() => {
        const currentTab = sidebarTabs.find(tab => tab.path === location.pathname);
        if (currentTab) {
            setActiveTab(currentTab.id);
        }
    }, [location.pathname]);

    const handleTabClick = (path: string) => {
        navigate(path);
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <img src={UnionLogo} alt="Veri Logo" className="sidebar-logo" />
            </div>
            <nav className="sidebar-nav">
                {sidebarTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            className={`sidebar-item ${isActive ? 'active' : ''} ${tab.className || ''}`}
                            onClick={() => handleTabClick(tab.path)}
                        >
                            <img
                                src={isActive ? tab.activeIcon : tab.icon}
                                alt={tab.name}
                                className="sidebar-icon"
                            />
                            <span className="sidebar-text">{tab.name}</span>
                        </button>
                    );
                })}
            </nav>
            <div className="sidebar-footer">
                <button className="sidebar-item" onClick={() => navigate('/my-page')}>
                    <span className="sidebar-text">마이페이지</span>
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
