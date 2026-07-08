import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './views/Home';
import News from './views/News';
import Staff from './views/Staff';
import CampusMap from './views/CampusMap';
import Contact from './views/Contact';
import Login from './views/Login';
import NewsDetail from './views/NewsDetail';
import AdminDashboard from './views/AdminDashboard';
import { dbService, updateCSSVariables } from './services/db';
import { authService } from './services/auth';

export default function App() {
  const [view, setView] = useState('home'); // home, news, news-detail, staff, campus, contact, login, admin
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [currentNewsItem, setCurrentNewsItem] = useState(null);
  const [user, setUser] = useState(null);

  // Initialize school info and user session on mount
  useEffect(() => {
    const initApp = async () => {
      // 1. Try to sync latest data from Supabase Cloud first
      await dbService.syncFromCloud();
      
      // 2. Load school info from storage (which now has latest synced data)
      const info = dbService.getSchoolInfo();
      setSchoolInfo(info);
      
      // Apply school colors to document CSS variables
      if (info && info.colors) {
        updateCSSVariables(info.colors);
      }

      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    };

    initApp();

    // Secret Entry Point: URL Hash routing listener
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/login' || hash === '#/admin-portal') {
        setView('login');
        window.scrollTo(0, 0);
      } else if (hash === '#/admin') {
        setView('admin');
        window.scrollTo(0, 0);
      } else if (hash === '#/home') {
        setView('home');
        window.scrollTo(0, 0);
      } else if (hash === '#/news') {
        setView('news');
        window.scrollTo(0, 0);
      } else if (hash === '#/staff') {
        setView('staff');
        window.scrollTo(0, 0);
      } else if (hash === '#/campus') {
        setView('campus');
        window.scrollTo(0, 0);
      } else if (hash === '#/contact') {
        setView('contact');
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Check initial hash on load
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Set up periodic cloud database polling and sync-on-focus
  useEffect(() => {
    const sync = async () => {
      await dbService.syncFromCloud();
    };

    // Poll every 15 seconds
    const interval = setInterval(sync, 15000);

    // Sync when browser tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App focused: Syncing cloud database...');
        sync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Listen for database changes (from polling/visibility updates) to refresh local state
  useEffect(() => {
    const handleDbUpdate = () => {
      console.log('Local DB changed. Refreshing App states...');
      const info = dbService.getSchoolInfo();
      setSchoolInfo(info);

      // If viewing a news item, refresh it in case it was edited on another device
      if (currentNewsItem) {
        const updatedItem = dbService.getNewsById(currentNewsItem.id);
        if (updatedItem) {
          setCurrentNewsItem(updatedItem);
        }
      }
    };

    window.addEventListener('school_db_updated', handleDbUpdate);
    return () => window.removeEventListener('school_db_updated', handleDbUpdate);
  }, [currentNewsItem]);

  // Update design styles when school color setting changes
  useEffect(() => {
    if (schoolInfo && schoolInfo.colors) {
      updateCSSVariables(schoolInfo.colors);
    }
  }, [schoolInfo]);

  // Route guard: Redirect admin view to login if not authenticated
  useEffect(() => {
    if (view === 'admin' && !user) {
      setView('login');
    }
  }, [view, user]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView('home');
    window.location.hash = ''; // clear hash
  };

  // Render view based on state
  const renderView = () => {
    if (!schoolInfo) return <div className="loading-app flex-center">กำลังโหลดระบบ...</div>;

    switch (view) {
      case 'home':
        return <Home schoolInfo={schoolInfo} setView={setView} setCurrentNewsItem={setCurrentNewsItem} />;
      case 'news':
        return <News setView={setView} setCurrentNewsItem={setCurrentNewsItem} />;
      case 'news-detail':
        return <NewsDetail newsItem={currentNewsItem} setView={setView} setCurrentNewsItem={setCurrentNewsItem} />;
      case 'staff':
        return <Staff />;
      case 'campus':
        return <CampusMap />;
      case 'contact':
        return <Contact schoolInfo={schoolInfo} />;
      case 'login':
        return <Login setView={setView} setUser={setUser} />;
      case 'admin':
        return user ? (
          <AdminDashboard 
            schoolInfo={schoolInfo} 
            setSchoolInfo={setSchoolInfo} 
            handleLogout={handleLogout} 
          />
        ) : null;
      default:
        return <Home schoolInfo={schoolInfo} setView={setView} setCurrentNewsItem={setCurrentNewsItem} />;
    }
  };

  if (!schoolInfo) {
    return <div className="loading-page flex-center">กำลังโหลดข้อมูลระบบเว็บไซต์โรงเรียน...</div>;
  }

  return (
    <>
      <Header currentView={view} setView={setView} user={user} setUser={setUser} schoolInfo={schoolInfo} />
      <main className="main-content-layout">
        {renderView()}
      </main>
      <Footer schoolInfo={schoolInfo} setView={setView} />

      <style>{`
        .loading-page {
          min-height: 100vh;
          font-family: 'Prompt', sans-serif;
          color: var(--color-primary);
          font-size: 1.25rem;
          font-weight: 500;
          background-color: var(--color-bg-body);
        }

        .main-content-layout {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </>
  );
}
