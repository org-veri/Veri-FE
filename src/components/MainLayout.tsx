import { useLocation } from 'react-router-dom';
import { shouldShowTabBar } from '../config/routes';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const withTabBar = shouldShowTabBar(location.pathname);

  return (
    <div className={withTabBar ? 'main-layout main-layout--with-tab-bar' : 'main-layout'}>
      {children}
    </div>
  );
}

export default MainLayout;
