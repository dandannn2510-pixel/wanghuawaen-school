import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import NewsCard from '../components/NewsCard';
import { BookOpen, Users, Compass, Award, ChevronRight } from 'lucide-react';

export default function Home({ schoolInfo, setView, setCurrentNewsItem }) {
  // Get top 3 latest published news as reactive state
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    const loadLatestNews = () => {
      const news = dbService.getNews().filter(item => item.status === 'published').slice(0, 3);
      setLatestNews(news);
    };

    loadLatestNews();
    window.addEventListener('school_db_updated', loadLatestNews);
    return () => window.removeEventListener('school_db_updated', loadLatestNews);
  }, []);

  const handleNewsClick = (news) => {
    setCurrentNewsItem(news);
    setView('news-detail');
  };

  return (
    <div className="home-view animate-fade-in">
      {/* 1. Hero Banner */}
      <section className="hero-banner">
        {schoolInfo.heroBgUrl && (
          <div 
            className="hero-bg-image-fade" 
            style={{ 
              backgroundImage: `url(${schoolInfo.heroBgUrl})`,
              position: 'absolute',
              inset: 0,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.45, // Increased presence of school background
              zIndex: 0,
              filter: 'brightness(0.35) contrast(1.12) blur(1px)' // Dimmed/darkened luxury overlay style
            }}
          />
        )}
        <div className="hero-overlay" style={{ zIndex: 1 }}></div>
        <div className="container hero-content">
          <div className="hero-badge">ยินดีต้อนรับสู่เว็บไซต์ทางการ</div>
          <h2 className="hero-title">{schoolInfo.name}</h2>
          <p className="hero-subtitle">{schoolInfo.nameEn}</p>
          <div className="school-divider">
            <span className="school-divider-dot"></span>
          </div>
          <p className="hero-slogan">“ {schoolInfo.slogan} ”</p>
          <p className="hero-region">{schoolInfo.region}</p>
          <button className="btn btn-secondary hero-btn" onClick={() => setView('news')}>
            อ่านข่าวประกาศโรงเรียน <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* 2. Director's Greeting & Vision */}
      <section className="section-padding greeting-section">
        <div className="container">
          <div className="grid-2 align-items-center">
            {/* Director Frame */}
            <div className="director-visual">
              <div className="director-image-frame">
                {/* Formal frame decoration */}
                <div className="frame-border-gold"></div>
                <div className="director-avatar-placeholder">
                  {/* Formal profile icon representing school director in uniform */}
                  <svg viewBox="0 0 100 100" className="director-svg">
                    <rect x="0" y="0" width="100" height="100" fill="#f3f4f6" />
                    <circle cx="50" cy="38" r="18" fill="var(--color-primary)" opacity="0.85" />
                    <path d="M 50 15 L 50 10 L 45 10 M 50 10 L 55 10" fill="none" stroke="var(--color-secondary)" strokeWidth="2" />
                    <path d="M 22 82 C 22 60, 32 55, 50 55 C 68 55, 78 60, 78 82 Z" fill="var(--color-primary)" />
                    {/* Golden epaulettes / medals representing Thai government officer uniform decoration */}
                    <path d="M 26 62 Q 32 60 38 64 M 74 62 Q 68 60 62 64" fill="none" stroke="var(--color-secondary)" strokeWidth="3" />
                    <rect x="47" y="55" width="6" height="12" fill="var(--color-secondary)" />
                  </svg>
                </div>
              </div>
              <div className="director-info-card">
                <h4 className="director-name">{schoolInfo.directorName}</h4>
                <p className="director-pos">{schoolInfo.directorPosition}</p>
              </div>
            </div>

            {/* Greeting Message */}
            <div className="greeting-text-area">
              <span className="section-tag">WELCOME MESSAGE</span>
              <h3 className="sub-section-title">สารจากผู้อำนวยการโรงเรียน</h3>
              <div className="title-underline"></div>
              <p className="director-message-content">
                "{schoolInfo.directorMsg}"
              </p>
              <div className="director-signature">
                <span className="signature-line"></span>
                <p className="sig-name">({schoolInfo.directorName})</p>
                <p className="sig-title">{schoolInfo.directorPosition}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. School Stats (ข้อมูลพื้นฐาน) */}
      <section className="stats-section section-padding text-center">
        <div className="container">
          <h3 className="section-title text-white">ข้อมูลพื้นฐานโรงเรียน</h3>
          <div className="school-divider">
            <span className="school-divider-dot" style={{ backgroundColor: 'var(--color-secondary)', borderColor: 'white' }}></span>
          </div>
          <div className="grid-3 stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Users size={32} />
              </div>
              <h4 className="stat-number">{schoolInfo.stats ? schoolInfo.stats.teachers : 5}</h4>
              <p className="stat-label">จำนวนบุคลากรครู</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <BookOpen size={32} />
              </div>
              <h4 className="stat-number">{schoolInfo.stats ? schoolInfo.stats.students : 65}</h4>
              <p className="stat-label">จำนวนนักเรียนทั้งหมด</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Compass size={32} />
              </div>
              <h4 className="stat-number">{schoolInfo.stats ? schoolInfo.stats.levels : '8'}</h4>
              <p className="stat-label">ระดับชั้นเรียน (อ.2 - ป.6)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Vision, Mission & Identity (วิสัยทัศน์ อัตลักษณ์) */}
      <section className="section-padding vision-section">
        <div className="container">
          <span className="section-tag text-center d-block">OUR COMMITMENTS</span>
          <h3 className="section-title">วิสัยทัศน์และพันธกิจ</h3>
          <p className="section-subtitle">ความมุ่งมั่นในการขับเคลื่อนการศึกษาที่มีคุณภาพ เพื่อลูกหลานชาววังหามแห</p>
          
          <div className="grid-3 commitments-grid">
            <div className="commitment-card">
              <div className="card-decor-line"></div>
              <div className="commit-icon-box">
                <Compass size={24} />
              </div>
              <h4>วิสัยทัศน์ (Vision)</h4>
              <p>{schoolInfo.vision || 'มุ่งพัฒนาผู้เรียนให้มีคุณภาพตามมาตรฐานการศึกษา สร้างเสริมคุณธรรมนำความรู้ ควบคู่เทคโนโลยี ร่วมใจสืบสานวัฒนธรรมไทย ใส่ใจสิ่งแวดล้อม น้อมนำปรัชญาของเศรษฐกิจพอเพียง'}</p>
            </div>
            
            <div className="commitment-card">
              <div className="card-decor-line"></div>
              <div className="commit-icon-box">
                <Award size={24} />
              </div>
              <h4>พันธกิจ (Mission)</h4>
              <p>{schoolInfo.mission || 'จัดการศึกษาตั้งแต่ระดับปฐมวัยถึงประถมศึกษาอย่างทั่วถึง พัฒนาระบบการเรียนรู้ เน้นผู้เรียนเป็นสำคัญ ส่งเสริมบุคลากรให้มีคุณภาพ และบริหารจัดการโดยชุมชนมีส่วนร่วม'}</p>
            </div>

            <div className="commitment-card">
              <div className="card-decor-line"></div>
              <div className="commit-icon-box">
                <Users size={24} />
              </div>
              <h4>อัตลักษณ์ (Identity)</h4>
              <p>{schoolInfo.identity || 'ยิ้มง่าย ไหว้สวย รวยน้ำใจ มีวินัยใฝ่การศึกษา ซึ่งเป็นจุดเน้นการหล่อหลอมพฤติกรรมพื้นฐานของเยาวชนและนักเรียนโรงเรียนบ้านวังหัวแหวนพัฒนาทุกคน'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Latest News Highlights */}
      <section className="section-padding news-highlights bg-white">
        <div className="container">
          <div className="flex-between-title">
            <div>
              <span className="section-tag">NEWS & ANNOUNCEMENTS</span>
              <h3 className="sub-section-title">ประชาสัมพันธ์และข่าวสารล่าสุด</h3>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setView('news')}>
              ข่าวสารทั้งหมด
            </button>
          </div>
          <div className="title-underline text-left"></div>
          
          {latestNews.length > 0 ? (
            <div className="grid-3 news-grid">
              {latestNews.map((item) => (
                <NewsCard 
                  key={item.id} 
                  item={item} 
                  onClick={() => handleNewsClick(item)} 
                />
              ))}
            </div>
          ) : (
            <div className="empty-state text-center py-5">
              <p className="text-muted">ขณะนี้ยังไม่มีข้อมูลข่าวประชาสัมพันธ์ประกาศในระบบ</p>
            </div>
          )}
        </div>
      </section>



      <style>{`
        /* Hero Banner */
        .hero-banner {
          position: relative;
          background: linear-gradient(135deg, var(--color-primary) 0%, #051324 100%);
          color: white;
          padding: 100px 0;
          text-align: center;
          overflow: hidden;
        }

        .hero-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: radial-gradient(var(--color-secondary) 1px, transparent 1px);
          background-size: 15px 15px;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }

        .hero-badge {
          background-color: var(--color-secondary);
          color: var(--color-primary);
          padding: 6px 16px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          display: inline-block;
          margin-bottom: 24px;
          font-family: var(--font-heading);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .hero-title {
          font-size: 3rem;
          color: white;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          margin-bottom: 12px;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: 2px;
          font-family: var(--font-heading);
          font-weight: 500;
        }

        .hero-slogan {
          font-size: 1.5rem;
          font-style: italic;
          color: var(--color-secondary);
          margin: 16px 0;
          font-family: var(--font-heading);
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .hero-region {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 30px;
        }

        .hero-btn {
          box-shadow: var(--shadow-lg);
          padding: 12px 30px;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem; }
          .hero-slogan { font-size: 1.25rem; }
          .hero-banner { padding: 70px 0; }
        }

        /* Director visual */
        .director-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .director-image-frame {
          position: relative;
          width: 250px;
          height: 310px;
          padding: 12px;
          background-color: white;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--color-border);
        }

        .frame-border-gold {
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          bottom: 6px;
          border: 2px solid var(--color-secondary);
          pointer-events: none;
          border-radius: 4px;
        }

        .director-avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 2px;
          overflow: hidden;
        }

        .director-svg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .director-info-card {
          margin-top: 16px;
          text-align: center;
          background-color: white;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          border-top: 3px solid var(--color-primary);
        }

        .director-name {
          font-size: 1.05rem;
          color: var(--color-primary);
          font-weight: 600;
          margin: 0;
        }

        .director-pos {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin: 4px 0 0;
        }

        /* Greeting Section */
        .greeting-section {
          background-color: #faf9f6; /* Warm elegant beige background */
        }

        .section-tag {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-secondary);
          letter-spacing: 1.5px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .d-block { display: block; }

        .sub-section-title {
          font-size: 1.8rem;
          color: var(--color-primary);
          font-weight: 600;
          margin-bottom: 8px;
        }

        .title-underline {
          height: 3px;
          width: 60px;
          background-color: var(--color-secondary);
          margin-bottom: 24px;
        }
        
        .title-underline.text-left {
          margin-left: 0;
        }

        .director-message-content {
          font-size: 1.05rem;
          color: var(--color-text-main);
          line-height: 1.8;
          font-style: italic;
          margin-bottom: 24px;
        }

        .director-signature {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding-right: 20px;
        }

        .signature-line {
          width: 120px;
          height: 1px;
          background-color: var(--color-text-muted);
          margin-bottom: 8px;
          opacity: 0.5;
        }

        .sig-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-heading);
        }

        .sig-title {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        /* Stats section */
        .stats-section {
          background: linear-gradient(135deg, var(--color-primary) 0%, #112814 100%);
          color: white;
          border-top: 3px solid var(--color-secondary);
          border-bottom: 3px solid var(--color-secondary);
        }

        .text-white {
          color: white !important;
        }

        .stats-grid {
          margin-top: 30px;
        }

        .stat-card {
          padding: 30px 20px;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: var(--transition-smooth);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          background-color: rgba(255, 255, 255, 0.08);
          border-color: var(--color-secondary);
        }

        .stat-icon-wrapper {
          color: var(--color-secondary);
          margin-bottom: 16px;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          line-height: 1.1;
          margin-bottom: 6px;
          font-family: var(--font-heading);
        }

        .stat-label {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        /* Commitments Section */
        .vision-section {
          background-color: #f8f9fa;
        }

        .commitments-grid {
          margin-top: 32px;
        }

        .commitment-card {
          position: relative;
          background-color: white;
          padding: 36px 24px 24px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
          transition: var(--transition-smooth);
        }

        .commitment-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary-medium);
        }

        .card-decor-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background-color: var(--color-primary);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        .commitment-card:hover .card-decor-line {
          background-color: var(--color-secondary);
        }

        .commit-icon-box {
          width: 50px;
          height: 50px;
          background-color: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: var(--transition-smooth);
        }

        .commitment-card:hover .commit-icon-box {
          background-color: var(--color-primary);
          color: white;
        }

        .commitment-card h4 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--color-primary);
        }

        .commitment-card p {
          font-size: 0.95rem;
          color: var(--color-text-main);
          line-height: 1.6;
        }

        /* News highlights header */
        .flex-between-title {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .news-grid {
          margin-top: 30px;
        }

        /* News detail inside modal styling */
        .news-detail-view {
          color: var(--color-text-main);
        }

        .news-detail-title {
          font-size: 1.5rem;
          color: var(--color-primary);
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 12px;
        }

        .news-detail-meta {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          display: flex;
          gap: 12px;
        }

        .news-detail-image-wrapper {
          width: 100%;
          max-height: 400px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 24px;
          border: 1px solid var(--color-border);
        }

        .news-detail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .news-detail-body {
          font-size: 1.05rem;
          line-height: 1.8;
          white-space: pre-line;
        }

        .content-paragraph {
          margin-bottom: 16px;
        }

        .paragraph-header {
          display: block;
          font-family: var(--font-heading);
          color: var(--color-primary);
          font-size: 1.15rem;
          margin-bottom: 8px;
        }

        .my-4 {
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          border: 0;
          border-top: 1px solid var(--color-border);
        }

        .mb-3 { margin-bottom: 1rem; }
      `}</style>
    </div>
  );
}
