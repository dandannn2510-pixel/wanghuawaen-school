import React from 'react';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export default function Footer({ schoolInfo, setView }) {
  const currentYear = new Date().getFullYear() + 543; // Thai Buddhist Calendar Year

  const handleNav = (view) => {
    setView(view);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="school-footer">
      <div className="footer-top-accent"></div>
      <div className="container footer-content section-padding">
        <div className="footer-grid">
          {/* School Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo-section">
              {schoolInfo && schoolInfo.logoUrl ? (
                <img src={schoolInfo.logoUrl} alt="Logo" className="footer-crest-svg" style={{ objectFit: 'contain', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', padding: '2px' }} />
              ) : (
                <svg viewBox="0 0 100 100" className="footer-crest-svg">
                  <circle cx="50" cy="50" r="46" fill="white" stroke="var(--color-secondary)" strokeWidth="3" />
                  <path d="M 50 15 Q 80 40 50 85 Q 20 40 50 15" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
                  <path d="M 32 45 L 50 25 L 68 45 L 50 65 Z" fill="var(--color-secondary)" />
                  <path d="M 40 50 Q 50 48 50 55 Q 50 48 60 50 M 40 52 L 40 57 Q 50 55 50 62 L 50 55 Q 50 55 50 62 Q 60 57 60 52 L 60 47" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
                  <path d="M 46 22 L 50 10 L 54 22 Z" fill="var(--color-primary)" />
                </svg>
              )}
              <div>
                <h3 className="footer-school-name">{schoolInfo.name}</h3>
                <p className="footer-school-sub">{schoolInfo.nameEn}</p>
              </div>
            </div>
            <p className="school-motto-text">“{schoolInfo.slogan}”</p>
            <p className="school-office-text">{schoolInfo.region}</p>
          </div>

          {/* Contact Info Column */}
          <div className="footer-contact">
            <h4 className="footer-heading">ติดต่อโรงเรียน</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={18} className="footer-icon" />
                <span>{schoolInfo.address}</span>
              </li>
              <li>
                <Phone size={18} className="footer-icon" />
                <a href={`tel:${schoolInfo.phone}`}>{schoolInfo.phone}</a>
              </li>
              <li>
                <Mail size={18} className="footer-icon" />
                <a href={`mailto:${schoolInfo.email}`}>{schoolInfo.email}</a>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="footer-links">
            <h4 className="footer-heading">แผนผังเว็บไซต์</h4>
            <ul className="footer-link-list">
              <li><button onClick={() => handleNav('home')}>หน้าแรก</button></li>
              <li><button onClick={() => handleNav('news')}>ข่าวประกาศ</button></li>
              <li><button onClick={() => handleNav('staff')}>ทำเนียบบุคลากร</button></li>
              <li><button onClick={() => handleNav('campus')}>แผนผังโรงเรียน</button></li>
              <li><button onClick={() => handleNav('contact')}>ข้อมูลติดต่อ</button></li>
            </ul>
          </div>

          {/* External Gov Links Column */}
          <div className="footer-external">
            <h4 className="footer-heading">ลิงก์หน่วยงานที่เกี่ยวข้อง</h4>
            <ul className="footer-link-list">
              <li>
                <a href="https://www.obec.go.th" target="_blank" rel="noopener noreferrer" className="ext-link">
                  สพฐ. <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.kpp2.go.th/main/index.php" target="_blank" rel="noopener noreferrer" className="ext-link">
                  สพป.กำแพงเพชร เขต 2 <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.moe.go.th" target="_blank" rel="noopener noreferrer" className="ext-link">
                  กระทรวงศึกษาธิการ <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>© พ.ศ. {currentYear} {schoolInfo.name}. สงวนลิขสิทธิ์ข้อมูลตามพระราชบัญญัติลิขสิทธิ์</p>
          <div className="footer-credits-admin" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <p>พัฒนาและบำรุงรักษาโดย โรงเรียนบ้านวังหัวแหวนพัฒนา</p>
            <button 
              onClick={() => handleNav('login')} 
              className="admin-login-footer-btn"
            >
              สำหรับผู้ดูแลระบบ (Admin Login)
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .school-footer {
          background-color: #0b1a2e; /* Extremely deep dark navy blue */
          color: #e2e8f0;
          margin-top: auto;
          position: relative;
        }

        .footer-top-accent {
          height: 4px;
          background-color: var(--color-secondary);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr;
          gap: 40px;
        }

        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        .footer-logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .footer-crest-svg {
          width: 48px;
          height: 48px;
        }

        .footer-school-name {
          color: white;
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0;
        }

        .footer-school-sub {
          color: #a0aec0;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .school-motto-text {
          font-style: italic;
          color: var(--color-secondary);
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .school-office-text {
          font-size: 0.85rem;
          color: #a0aec0;
        }

        .footer-heading {
          color: white;
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 8px;
        }

        .footer-heading::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 2px;
          background-color: var(--color-secondary);
        }

        .footer-contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-contact-list li {
          display: flex;
          gap: 10px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .footer-icon {
          color: var(--color-secondary);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .footer-contact-list a:hover {
          color: white;
          text-decoration: underline;
        }

        .footer-link-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-link-list button {
          background: none;
          border: none;
          color: #cbd5e1;
          font-family: var(--font-body);
          font-size: 0.9rem;
          text-align: left;
          cursor: pointer;
          padding: 0;
          transition: var(--transition-fast);
        }

        .footer-link-list button:hover {
          color: white;
          padding-left: 4px;
        }

        .footer-link-list a {
          color: #cbd5e1;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .footer-link-list a:hover {
          color: white;
        }

        .footer-bottom {
          background-color: #0b190c;
          padding: 16px 0;
          font-size: 0.75rem;
          color: #718096;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .admin-login-footer-btn {
          background: none;
          border: none;
          color: #718096;
          cursor: pointer;
          font-size: 0.75rem;
          font-family: var(--font-body);
          text-decoration: underline;
          padding: 0;
          transition: var(--transition-fast);
        }

        .admin-login-footer-btn:hover {
          color: var(--color-secondary) !important;
        }

        @media (max-width: 768px) {
          .footer-credits-admin {
            justify-content: center;
            width: 100%;
            margin-top: 4px;
          }
        }

        @media (max-width: 768px) {
          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
