import React, { useState, useEffect } from 'react';
import { LogOut, Menu, X, ShieldAlert, Home, Newspaper, PhoneCall } from 'lucide-react';
import { authService } from '../services/auth';

export default function Header({ currentView, setView, user, setUser, schoolInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView('home');
    setIsOpen(false);
  };

  const handleNav = (view) => {
    setView(view);
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  const isActive = (view) => currentView === view ? 'nav-link active' : 'nav-link';

  return (
    <header className={`school-header ${scrolled ? 'scrolled' : ''}`}>
      {/* Top Gold Bar */}
      <div className="header-top-bar">
        <div className="container header-top-content">
          <span>สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษากำแพงเพชร เขต 2</span>
          <span>ติดต่อ: 0-5578-0246</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="header-main-nav">
        <div className="container nav-container">
          {/* Logo & School Name */}
          <div 
            className="logo-section" 
            onClick={() => handleNav('home')} 
            style={{ cursor: 'pointer' }}
          >
            <div className="school-logo-crest">
              {schoolInfo && schoolInfo.logoUrl ? (
                <img src={schoolInfo.logoUrl} alt="Logo" className="crest-svg" style={{ objectFit: 'contain', width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : (
                /* Formal Emblem Crest SVG */
                <svg viewBox="0 0 100 100" className="crest-svg">
                  <circle cx="50" cy="50" r="46" fill="var(--color-primary)" stroke="var(--color-secondary)" strokeWidth="3" />
                  <path d="M 50 15 Q 80 40 50 85 Q 20 40 50 15" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" />
                  <path d="M 32 45 L 50 25 L 68 45 L 50 65 Z" fill="var(--color-secondary)" opacity="0.9" />
                  {/* Book icon in center */}
                  <path d="M 40 50 Q 50 48 50 55 Q 50 48 60 50 M 40 52 L 40 57 Q 50 55 50 62 L 50 55 Q 50 55 50 62 Q 60 57 60 52 L 60 47" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
                  {/* Crown/flame on top */}
                  <path d="M 46 22 L 50 10 L 54 22 Z" fill="var(--color-secondary)" />
                </svg>
              )}
            </div>
            <div className="school-name-text">
              <h1 className="logo-title">โรงเรียนบ้านวังหัวแหวนพัฒนา</h1>
              <p className="logo-subtitle">BAN WANG HUA WAEN PHATTHANA SCHOOL</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <button onClick={() => handleNav('home')} className={isActive('home')}>
              <Home size={16} /> หน้าแรก
            </button>
            <button onClick={() => handleNav('news')} className={isActive('news')}>
              <Newspaper size={16} /> ข่าวประกาศ
            </button>
            <button onClick={() => handleNav('staff')} className={isActive('staff')}>
              ทำเนียบบุคลากร
            </button>
            <button onClick={() => handleNav('campus')} className={isActive('campus')}>
              แผนผังโรงเรียน
            </button>
            <button onClick={() => handleNav('contact')} className={isActive('contact')}>
              <PhoneCall size={16} /> ข้อมูลติดต่อ
            </button>
            
            {user && <span className="nav-divider"></span>}
            
            {user && (
              <div className="admin-status-nav">
                <button onClick={() => handleNav('admin')} className={isActive('admin')}>
                  <ShieldAlert size={16} /> ระบบจัดการ (Admin)
                </button>
                <button onClick={handleLogout} className="btn-logout" title="ออกจากระบบ">
                  <LogOut size={16} /> ออกจากระบบ
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="mobile-nav-drawer animate-fade-in">
          <button onClick={() => handleNav('home')} className={isActive('home')}>
            หน้าแรก
          </button>
          <button onClick={() => handleNav('news')} className={isActive('news')}>
            ข่าวประกาศ
          </button>
          <button onClick={() => handleNav('staff')} className={isActive('staff')}>
            ทำเนียบบุคลากร
          </button>
          <button onClick={() => handleNav('campus')} className={isActive('campus')}>
            แผนผังโรงเรียน
          </button>
          <button onClick={() => handleNav('contact')} className={isActive('contact')}>
            ข้อมูลติดต่อ
          </button>
          
          {user && <hr className="mobile-divider" />}
          
          {user && (
            <>
              <div className="mobile-admin-info">
                <span>ผู้ใช้งาน: {user.name}</span>
              </div>
              <button onClick={() => handleNav('admin')} className={isActive('admin')}>
                ระบบจัดการ (Admin)
              </button>
              <button onClick={handleLogout} className="mobile-btn-logout">
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </>
          )}
        </div>
      )}

      {/* Styles specific to header */}
      <style>{`
        .school-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: white;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }
        
        .school-header.scrolled {
          box-shadow: var(--shadow-md);
        }
        
        .header-top-bar {
          background-color: var(--color-primary);
          color: white;
          font-size: 0.8rem;
          padding: 6px 0;
          border-bottom: 2px solid var(--color-secondary);
        }
        
        .header-top-content {
          display: flex;
          justify-content: space-between;
          font-weight: 300;
        }

        .header-main-nav {
          padding: 12px 0;
          border-bottom: 1px solid var(--color-border);
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .school-logo-crest {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .crest-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .school-name-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 1.25rem;
          color: var(--color-primary);
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .logo-subtitle {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          font-weight: 600;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-link {
          background: none;
          border: none;
          padding: 8px 16px;
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-text-main);
          border-radius: var(--radius-md);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--color-primary);
          background-color: var(--color-primary-light);
        }

        .nav-link.active {
          color: white;
          background-color: var(--color-primary);
        }

        .nav-divider {
          height: 24px;
          width: 1px;
          background-color: var(--color-border);
          margin: 0 10px;
        }

        .admin-status-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-logout {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--color-danger);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition-fast);
        }

        .btn-logout:hover {
          background-color: var(--color-danger);
          color: white;
        }

        .btn-login-nav {
          background-color: transparent;
          border: 1px solid var(--color-secondary);
          color: var(--color-primary);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition-smooth);
        }

        .btn-login-nav:hover {
          background-color: var(--color-secondary);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
        }

        .mobile-nav-drawer {
          display: none;
          background-color: white;
          padding: 16px 24px;
          border-top: 1px solid var(--color-border);
          box-shadow: var(--shadow-md);
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 992px) {
          .desktop-nav {
            display: none;
          }
          
          .mobile-menu-toggle {
            display: block;
          }
          
          .mobile-nav-drawer {
            display: flex;
          }
          
          .mobile-nav-drawer .nav-link {
            width: 100%;
            justify-content: flex-start;
          }

          .mobile-divider {
            border: 0;
            border-top: 1px solid var(--color-border);
            margin: 8px 0;
          }

          .mobile-admin-info {
            font-size: 0.85rem;
            color: var(--color-text-muted);
            padding-left: 16px;
          }

          .mobile-btn-logout {
            background-color: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.15);
            color: var(--color-danger);
            padding: 10px;
            border-radius: var(--radius-md);
            text-align: center;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
          }
          
          .mobile-btn-login {
            background-color: var(--color-secondary-light);
            border: 1px solid var(--color-secondary);
            color: var(--color-primary);
            padding: 10px;
            border-radius: var(--radius-md);
            text-align: center;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
          }
        }
      `}</style>
    </header>
  );
}
