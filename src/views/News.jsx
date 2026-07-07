import React, { useState } from 'react';
import { dbService } from '../services/db';
import NewsCard from '../components/NewsCard';
import { Search, AlertCircle } from 'lucide-react';

export default function News({ setView, setCurrentNewsItem }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const newsList = dbService.getNews().filter(item => item.status === 'published');

  // Categories list
  const categories = [
    { value: 'all', label: 'ข่าวสารทั้งหมด' },
    { value: 'announcement', label: 'ประกาศสำคัญ' },
    { value: 'pr', label: 'ข่าวประชาสัมพันธ์' },
    { value: 'activity', label: 'ข่าวกิจกรรม' }
  ];

  // Filtering news based on search query and category tab
  const filteredNews = newsList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
    <div className="news-view container section-padding animate-fade-in">
      {/* Page Title Header */}
      <div className="page-header text-center">
        <span className="section-tag">ANNOUNCEMENTS</span>
        <h2 className="section-title">ข่าวสารและประกาศ</h2>
        <div className="school-divider">
          <span className="school-divider-dot"></span>
        </div>
        <p className="section-subtitle">ติดตามความเคลื่อนไหว ประกาศรับสมัคร กิจกรรม และข่าวสารประชาสัมพันธ์ต่างๆ ของโรงเรียน</p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar-section">
        {/* Search Input bar */}
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="พิมพ์คำค้นหาข่าวประกาศ..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories filters */}
        <div className="filter-tabs-wrapper">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`filter-tab-btn ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid Output */}
      {filteredNews.length > 0 ? (
        <div className="grid-3 news-grid-list">
          {filteredNews.map((item) => (
             <NewsCard 
               key={item.id} 
               item={item} 
               onClick={() => {
                 setCurrentNewsItem(item);
                 setView('news-detail');
               }} 
             />
          ))}
        </div>
      ) : (
        <div className="empty-results-state text-center">
          <AlertCircle size={48} className="empty-icon text-muted" />
          <h4>ไม่พบข้อมูลข่าวประกาศ</h4>
          <p className="text-muted">ไม่พบข้อมูลที่ตรงกับการค้นหาหรือตัวกรองของคุณ กรุณาลองใช้คำอื่น</p>
          <button className="btn btn-outline btn-sm mt-3" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
            ล้างคำค้นหาและตัวกรอง
          </button>
        </div>
      )}



      <style>{`
        .page-header {
          margin-bottom: 40px;
        }

        .toolbar-section {
          background-color: white;
          padding: 20px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
          margin-bottom: 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .search-bar-wrapper {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-family: var(--font-body);
          font-size: 1rem;
          background-color: var(--color-bg-body);
          transition: var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          background-color: white;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .filter-tabs-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .filter-tab-btn {
          background: none;
          border: 1px solid var(--color-border);
          padding: 8px 16px;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-main);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .filter-tab-btn:hover {
          background-color: var(--color-bg-body);
          border-color: var(--color-text-muted);
        }

        .filter-tab-btn.active {
          background-color: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }

        .news-grid-list {
          margin-top: 10px;
        }

        .empty-results-state {
          padding: 60px 20px;
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
        }

        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-results-state h4 {
          font-size: 1.25rem;
          color: var(--color-text-heading);
          margin-bottom: 8px;
        }

        .empty-results-state p {
          max-width: 400px;
          margin: 0 auto;
        }

        .mt-3 { margin-top: 1rem; }
      `}</style>
    </div>
  );
}
