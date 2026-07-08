import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, User, ArrowLeft, Newspaper, ChevronRight, Download, Eye, Pin, Image as ImageIcon } from 'lucide-react';
import { dbService } from '../services/db';

export default function NewsDetail({ newsItem, setView, setCurrentNewsItem }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [allNews, setAllNews] = useState([]);

  useEffect(() => {
    const loadNews = () => {
      setAllNews(dbService.getNews());
    };
    loadNews();
    window.addEventListener('school_db_updated', loadNews);
    return () => window.removeEventListener('school_db_updated', loadNews);
  }, []);
  
  // Filter out current news item for the sidebar suggestions
  const relatedNews = allNews.filter(n => n.id !== (newsItem ? newsItem.id : '')).slice(0, 4);

  const parseGalleryUrls = (galleryUrlsStr) => {
    if (!galleryUrlsStr) return [];
    if (galleryUrlsStr.includes('|')) {
      return galleryUrlsStr.split('|').map(url => url.trim()).filter(Boolean);
    }
    if (galleryUrlsStr.trim().startsWith('data:')) {
      return [galleryUrlsStr.trim()];
    }
    return galleryUrlsStr.split(',').map(url => url.trim()).filter(Boolean);
  };

  const galleryImages = parseGalleryUrls(newsItem.galleryUrls);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Increment view count in database
    if (newsItem && newsItem.id) {
      dbService.incrementNewsViews(newsItem.id);
    }
  }, [newsItem]);

  if (!newsItem) {
    return (
      <div className="container section-padding text-center" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p className="text-muted" style={{ fontSize: '1.1rem', margin: 0 }}>ไม่พบข้อมูลข่าวสารที่คุณต้องการ หรือระบบกำลังโหลดข้อมูล...</p>
        <button onClick={() => setView('news')} className="btn btn-primary" style={{ fontFamily: 'var(--font-heading)' }}>
          ย้อนกลับไปหน้าข่าวประกาศทั้งหมด
        </button>
      </div>
    );
  }

  const handleBack = () => {
    setView('news');
  };

  const handleSelectNews = (item) => {
    setCurrentNewsItem(item);
    window.scrollTo(0, 0);
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'announcement': return 'ประกาศสำคัญ';
      case 'pr': return 'ข่าวประชาสัมพันธ์';
      case 'activity': return 'ข่าวกิจกรรม';
      default: return 'ทั่วไป';
    }
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[2]);
        const monthIndex = parseInt(parts[1]) - 1;
        const year = parseInt(parts[0]) + 543;
        return `${day} ${months[monthIndex]} พ.ศ. ${year}`;
      }
    } catch (e) {
      console.error(e);
    }
    return dateStr;
  };

  return (
    <div className="news-detail-page container section-padding animate-fade-in">
      {/* Back button */}
      <button onClick={handleBack} className="btn-back-link">
        <ArrowLeft size={16} /> ย้อนกลับไปยังหน้าข่าวประกาศทั้งหมด
      </button>

      <div className="news-detail-layout mt-4">
        {/* Main Content Area */}
        <article className="news-main-article">
          <header className="article-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`badge badge-${newsItem.category} mb-2`}>
                {getCategoryText(newsItem.category)}
              </span>
              {newsItem.isPinned && (
                <span className="badge badge-pinned mb-2" style={{ backgroundColor: '#f97316', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: '600', borderRadius: '4px' }}>
                  <Pin size={12} fill="white" /> ปักหมุดประกาศ
                </span>
              )}
            </div>
            <h1 className="article-title">{newsItem.title}</h1>
            <p className="article-subtitle">{newsItem.subtitle}</p>

            <div className="article-meta">
              <span className="meta-item"><Calendar size={14} /> เผยแพร่เมื่อ: {formatThaiDate(newsItem.date)}</span>
              <span className="meta-item"><User size={14} /> โดย: {newsItem.author || 'งานประชาสัมพันธ์โรงเรียน'}</span>
              <span className="meta-item"><Eye size={14} /> ผู้เข้าชม: {(newsItem.views || 0).toLocaleString()} ครั้ง</span>
            </div>
          </header>

          <hr className="divider-line" />

          {/* Cover image or fallback pattern banner */}
          <div 
            className="article-cover-wrapper" 
            style={newsItem.imageUrl || galleryImages.length > 0 ? { cursor: 'zoom-in' } : {}}
            onClick={() => {
              const imgToZoom = newsItem.imageUrl || galleryImages[0];
              if (imgToZoom) setLightboxImage(imgToZoom);
            }}
          >
            {newsItem.imageUrl ? (
              <img src={newsItem.imageUrl} alt={newsItem.title} className="article-cover-img" />
            ) : galleryImages.length > 0 ? (
              <img src={galleryImages[0]} alt={newsItem.title} className="article-cover-img" />
            ) : (
              <div className={`article-cover-fallback bg-gradient-${newsItem.category || 'pr'}`}>
                <div className="fallback-pattern"></div>
                <Newspaper size={48} className="fallback-icon" />
                <h4 className="fallback-title">โรงเรียนบ้านวังหัวแหวนพัฒนา</h4>
                <p className="fallback-desc">ข่าวสารอย่างเป็นทางการของสถาบัน</p>
              </div>
            )}
          </div>

          {/* Article Body Content */}
          <div className="article-body">
            {newsItem.content.split('\n\n').map((para, i) => {
              if (para.startsWith('**') && para.includes('**\n')) {
                const titleEnd = para.indexOf('**\n');
                const headerText = para.substring(2, titleEnd);
                const bodyText = para.substring(titleEnd + 3);
                return (
                  <div key={i} className="content-block">
                    <h3 className="block-header">{headerText}</h3>
                    <p className="block-body">{bodyText}</p>
                  </div>
                );
              }
              return <p key={i} className="body-para">{para}</p>;
            })}
          </div>

          {/* Attachment Download Section */}
          {newsItem.attachmentName && newsItem.attachmentUrl && (
            <div className="article-attachment-download-box">
              <Download size={24} className="download-icon" />
              <div className="download-info">
                <h4 className="download-title">เอกสารแนบข่าวประกาศ:</h4>
                <p className="download-filename">{newsItem.attachmentName}</p>
              </div>
              <a 
                href={newsItem.attachmentUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary download-btn"
              >
                ดาวน์โหลดไฟล์แนบ
              </a>
            </div>
          )}

          {/* Image Gallery Section */}
          {galleryImages.length > 0 && (
            <div className="article-gallery-section mt-5">
              <h3 className="gallery-section-title"><ImageIcon size={18} /> รูปภาพประกอบเพิ่มเติม</h3>
              <div className="gallery-section-divider"></div>
              <div className="gallery-grid">
                {galleryImages.map((trimmedUrl, index) => (
                  <div 
                    key={index} 
                    className="gallery-image-wrapper"
                    style={{ cursor: 'zoom-in' }}
                    onClick={() => setLightboxImage(trimmedUrl)}
                  >
                    <img 
                      src={trimmedUrl} 
                      alt={`ภาพประกอบข่าวที่ ${index + 1}`} 
                      className="gallery-image" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar suggestions */}
        <aside className="news-sidebar-suggestions">
          <div className="sidebar-sticky-box">
            <h3 className="sidebar-section-title">ข่าวสารประกาศอื่นๆ</h3>
            <div className="sidebar-divider"></div>
            
            <div className="suggested-news-stack">
              {relatedNews.map((item) => (
                <div 
                  key={item.id} 
                  className="suggested-card"
                  onClick={() => handleSelectNews(item)}
                >
                  <div className="suggested-thumb-wrapper">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="suggested-thumb" />
                    ) : (
                      <div className={`suggested-thumb-fallback bg-gradient-${item.category || 'pr'}`}>
                        C
                      </div>
                    )}
                  </div>
                  <div className="suggested-info">
                    <span className="suggested-date">{formatThaiDate(item.date)}</span>
                    <h4 className="suggested-title" title={item.title}>{item.title}</h4>
                    <span className="suggested-action">
                      อ่านต่อ <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
              
              {relatedNews.length === 0 && (
                <p className="text-muted text-center py-4">ไม่มีข่าวประชาสัมพันธ์อื่นแนะนำในขณะนี้</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .btn-back-link {
          background: none;
          border: none;
          color: var(--color-primary);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          transition: var(--transition-fast);
        }

        .btn-back-link:hover {
          background-color: var(--color-primary-light);
          color: var(--color-primary-hover);
        }

        .news-detail-layout {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .news-detail-layout {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        /* Main Article */
        .news-main-article {
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          padding: 40px;
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 600px) {
          .news-main-article {
            padding: 20px;
          }
        }

        .article-title {
          font-size: 2rem;
          color: var(--color-primary);
          font-weight: 700;
          line-height: 1.35;
          margin-bottom: 12px;
        }

        .article-subtitle {
          font-size: 1.1rem;
          color: var(--color-text-main);
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .article-meta {
          display: flex;
          gap: 20px;
          font-size: 0.85rem;
          color: var(--color-text-muted);
          flex-wrap: wrap;
        }

        .divider-line {
          border: 0;
          border-top: 1px solid var(--color-border);
          margin: 20px 0;
        }

        .article-cover-wrapper {
          width: 100%;
          max-height: 480px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 30px;
          border: 1px solid var(--color-border);
        }

        .article-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .article-cover-fallback {
          width: 100%;
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          padding: 24px;
          position: relative;
        }

        .fallback-icon {
          margin-bottom: 16px;
          opacity: 0.9;
        }

        .fallback-title {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 600;
        }

        .fallback-desc {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-top: 4px;
        }

        .article-body {
          font-size: 1.08rem;
          line-height: 1.8;
          color: var(--color-text-main);
        }

        .body-para {
          margin-bottom: 20px;
          white-space: pre-wrap;
        }

        .content-block {
          margin-bottom: 24px;
        }

        .block-header {
          font-size: 1.25rem;
          color: var(--color-primary);
          font-weight: 600;
          margin-bottom: 10px;
          border-left: 4px solid var(--color-secondary);
          padding-left: 12px;
        }

        .block-body {
          white-space: pre-wrap;
        }

        /* Sidebar suggestions */
        .sidebar-sticky-box {
          position: sticky;
          top: 100px;
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }

        .sidebar-section-title {
          font-size: 1.15rem;
          color: var(--color-primary);
          font-weight: 600;
          margin-bottom: 12px;
        }

        .sidebar-divider {
          height: 2px;
          background-color: var(--color-secondary);
          width: 50px;
          margin-bottom: 20px;
        }

        .suggested-news-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .suggested-card {
          display: flex;
          gap: 12px;
          cursor: pointer;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
          transition: var(--transition-fast);
        }

        .suggested-card:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .suggested-card:hover .suggested-title {
          color: var(--color-secondary);
        }

        .suggested-thumb-wrapper {
          width: 70px;
          height: 70px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          flex-shrink: 0;
          background-color: var(--color-bg-body);
        }

        .suggested-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .suggested-thumb-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.1rem;
        }

        .suggested-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0; /* allows text truncation */
        }

        .suggested-date {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-bottom: 4px;
        }

        .suggested-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-heading);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .suggested-action {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-primary);
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .mt-4 { margin-top: 1.5rem; }
        .mb-2 { margin-bottom: 0.5rem; }

        /* Attachment Box */
        .article-attachment-download-box {
          display: flex;
          align-items: center;
          gap: 16px;
          background-color: var(--color-primary-light);
          border: 1px solid var(--color-primary-medium);
          padding: 20px;
          border-radius: var(--radius-lg);
          margin-top: 30px;
        }
        
        .download-icon {
          color: var(--color-primary);
          flex-shrink: 0;
        }
        
        .download-info {
          display: flex;
          flex-direction: column;
        }
        
        .download-title {
          font-size: 0.95rem;
          color: var(--color-primary);
          font-weight: 600;
          margin: 0;
        }
        
        .download-filename {
          font-size: 0.9rem;
          color: var(--color-text-main);
          margin: 4px 0 0 0;
        }
        
        .download-btn {
          margin-left: auto;
          font-family: var(--font-heading);
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          box-shadow: var(--shadow-sm);
        }
        
        @media (max-width: 600px) {
          .article-attachment-download-box {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }
          .download-btn {
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }
        }
        
        /* Gallery */
        .article-gallery-section {
          margin-top: 40px;
          border-top: 1px solid var(--color-border);
          padding-top: 24px;
        }
        
        .gallery-section-title {
          font-size: 1.2rem;
          color: var(--color-primary);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .gallery-section-divider {
          height: 2px;
          background-color: var(--color-secondary);
          width: 40px;
          margin-bottom: 20px;
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }
        
        .gallery-image-wrapper {
          height: 120px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--color-border);
          transition: var(--transition-smooth);
        }
        
        .gallery-image-wrapper:hover {
          transform: scale(1.03);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary-medium);
        }
        
        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .mt-5 { margin-top: 3rem; }

        /* Lightbox Image Zoom Styling */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 24px;
          animation: fadeInOverlay 0.2s ease-out forwards;
        }

        .lightbox-close-btn {
          position: absolute;
          top: max(24px, env(safe-area-inset-top));
          right: max(24px, env(safe-area-inset-right));
          background: rgba(0, 0, 0, 0.6); /* Darker overlay for better contrast */
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 2rem;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          z-index: 10001; /* Ensure close button stays on top */
          transition: var(--transition-fast);
        }

        .lightbox-close-btn:hover {
          background-color: rgba(0, 0, 0, 0.8);
          transform: scale(1.05);
        }

        .lightbox-img {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: var(--radius-md);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          transform: scale(0.95);
        }

        .animate-zoom-in {
          animation: zoomInImg 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoomInImg {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Image Lightbox / Zoom Modal (Rendered outside parent layout context to prevent transform-related fixed position issues) */}
      {lightboxImage && createPortal(
        <div 
          className="lightbox-overlay" 
          onClick={() => setLightboxImage(null)}
        >
          <button 
            type="button" 
            className="lightbox-close-btn"
            onClick={() => setLightboxImage(null)}
          >
            ×
          </button>
          
          <img 
            src={lightboxImage} 
            alt="Expanded view" 
            className="lightbox-img animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
