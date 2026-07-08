import React from 'react';
import { Calendar, ArrowRight, BookOpen, Volume2, Award, Eye, Download, Pin } from 'lucide-react';

export default function NewsCard({ item, onClick }) {
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'announcement':
        return <span className="badge badge-announcement">ประกาศสำคัญ</span>;
      case 'pr':
        return <span className="badge badge-pr">ข่าวประชาสัมพันธ์</span>;
      case 'activity':
        return <span className="badge badge-activity">ข่าวกิจกรรม</span>;
      default:
        return <span className="badge badge-pr">ข่าวสาร</span>;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'announcement':
        return <Volume2 size={24} className="card-decor-icon text-danger" />;
      case 'pr':
        return <Award size={24} className="card-decor-icon text-warning" />;
      case 'activity':
        return <BookOpen size={24} className="card-decor-icon text-primary" />;
      default:
        return <BookOpen size={24} className="card-decor-icon" />;
    }
  };

  // Convert date format from YYYY-MM-DD to formal Thai date
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
        const year = parseInt(parts[0]) + 543; // convert to Buddhist Era
        return `${day} ${months[monthIndex]} พ.ศ. ${year}`;
      }
    } catch (e) {
      console.error("Error formatting date:", e);
    }
    return dateStr;
  };

  const firstGalleryImg = item.galleryUrls ? item.galleryUrls.split(',')[0]?.trim() : '';
  const displayImage = item.imageUrl || firstGalleryImg;

  return (
    <article className="news-card" onClick={onClick}>
      {/* Cover Image or Dynamic Formal Placeholder */}
      <div className="card-cover-container">
        {displayImage ? (
          <img src={displayImage} alt={item.title} className="card-image" />
        ) : (
          <div className={`card-placeholder-fallback bg-gradient-${item.category || 'pr'}`}>
            <div className="fallback-pattern"></div>
            {getCategoryIcon(item.category)}
            <span className="fallback-crest-text">โรงเรียนบ้านวังหัวแหวนพัฒนา</span>
          </div>
        )}
        <div className="card-category-floating" style={{ display: 'flex', gap: '6px' }}>
          {item.isPinned && (
            <span className="badge badge-pinned" style={{ backgroundColor: '#f97316', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: '600', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Pin size={11} fill="white" /> ปักหมุด
            </span>
          )}
          {getCategoryBadge(item.category)}
        </div>
      </div>

      {/* Card Info */}
      <div className="card-body">
        <div className="card-meta">
          <span className="meta-item">
            <Calendar size={14} />
            {formatThaiDate(item.date)}
          </span>
          <span className="meta-item" title={`เข้าชม ${(item.views || 0).toLocaleString()} ครั้ง`}>
            <Eye size={14} />
            {(item.views || 0).toLocaleString()}
          </span>
          {item.attachmentUrl && (
            <span className="meta-item text-primary" title="มีไฟล์เอกสารดาวน์โหลดแนบ" style={{ color: 'var(--color-primary)' }}>
              <Download size={14} />
            </span>
          )}
        </div>
        
        <h3 className="card-title" title={item.title}>
          {item.title}
        </h3>
        
        <p className="card-description">
          {item.subtitle || (item.content ? item.content.slice(0, 80) + '...' : '')}
        </p>
        
        <div className="card-footer-action">
          <span className="read-more-btn">
            อ่านรายละเอียดเพิ่มเติม
            <ArrowRight size={14} className="arrow-icon" />
          </span>
        </div>
      </div>

      <style>{`
        .news-card {
          background-color: var(--color-bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .news-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-premium);
          border-color: var(--color-primary-medium);
        }

        .card-cover-container {
          position: relative;
          height: 200px;
          overflow: hidden;
          background-color: #f3f4f6;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }

        .news-card:hover .card-image {
          transform: scale(1.05);
        }

        /* Gradient fallbacks for lack of news images */
        .card-placeholder-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          padding: 20px;
          text-align: center;
          overflow: hidden;
        }

        .fallback-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(circle, white 1px, transparent 1px);
          background-size: 10px 10px;
        }

        .bg-gradient-announcement {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
        }

        .bg-gradient-pr {
          background: linear-gradient(135deg, #1e4620 0%, #112814 100%);
        }

        .bg-gradient-activity {
          background: linear-gradient(135deg, #cf9c27 0%, #906913 100%);
        }

        .card-decor-icon {
          width: 48px;
          height: 48px;
          color: rgba(255, 255, 255, 0.9) !important;
          margin-bottom: 12px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
        }

        .fallback-crest-text {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.8;
        }

        .card-category-floating {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-meta {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 10px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-text-heading);
          margin-bottom: 10px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 3.2em; /* Ensure uniform title height */
        }

        .news-card:hover .card-title {
          color: var(--color-primary);
        }

        .card-description {
          font-size: 0.9rem;
          color: var(--color-text-main);
          margin-bottom: 20px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 4.5em; /* Ensure uniform height */
        }

        .card-footer-action {
          margin-top: auto;
          border-top: 1px solid var(--color-border);
          padding-top: 12px;
        }

        .read-more-btn {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-primary);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .arrow-icon {
          transition: transform 0.2s ease;
        }

        .news-card:hover .arrow-icon {
          transform: translateX(4px);
        }
      `}</style>
    </article>
  );
}
