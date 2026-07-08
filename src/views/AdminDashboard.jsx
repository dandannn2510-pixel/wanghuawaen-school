import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dbService } from '../services/db';
import { 
  Newspaper, Settings, FileText, Plus, Edit, Trash2, LayoutDashboard, 
  Save, AlertTriangle, Eye, RefreshCw, Sparkles, LogOut, CheckCircle, MailOpen,
  Pin, GraduationCap, Users, ArrowUp, ArrowDown, Download, Image as ImageIcon, Link,
  Shield
} from 'lucide-react';
import Modal from '../components/Modal';

// Helper widgets for Image Uploading (Base64)
const ImageUploadWidget = ({ label, value, onChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result;
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxDim = 1600; // Limit max resolution to 1600px for high quality

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.85 quality for clearer display
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressed);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="image-upload-widget">
      <label className="form-label">{label}</label>
      <div className="upload-container">
        {value ? (
          <div className="upload-preview-wrapper">
            <img src={value} alt="Preview" className="upload-preview" />
            <button type="button" className="btn-remove-image" onClick={handleClear} title="ลบรูปภาพ">
              ลบรูปภาพนี้ออก
            </button>
          </div>
        ) : (
          <label className="upload-dropzone">
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', marginBottom: '8px', fontSize: '1.5rem', fontWeight: 'bold' }}>
              +
            </span>
            <span className="upload-text">คลิกเพื่ออัปโหลดรูปภาพโดยตรง (ไม่เกิน 2MB)</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden-file-input"
            />
          </label>
        )}
      </div>
    </div>
  );
};

// Safe parser for gallery URLs supporting both legacy CSV and new Base64 pipe delimiter
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

const MultipleImageUploadWidget = ({ label, value, onChange }) => {
  const images = parseGalleryUrls(value);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    let loadedImages = [...images];
    let loadedCount = 0;
    
    if (loadedImages.length + files.length > 8) {
      alert("สามารถอัปโหลดภาพเพิ่มเติมได้สูงสุด 8 รูป");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result;
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxDim = 1200; // Limit gallery items max resolution to 1200px for clearer display

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.8 quality for clearer gallery storage size
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          loadedImages.push(compressed);
          loadedCount++;
          
          if (loadedCount === files.length) {
            onChange(loadedImages.join('|'));
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (indexToRemove) => {
    const filtered = images.filter((_, idx) => idx !== indexToRemove);
    onChange(filtered.join('|'));
  };

  return (
    <div className="image-upload-widget">
      <label className="form-label">{label}</label>
      <div className="multiple-upload-container">
        <div className="gallery-previews-grid">
          {images.map((img, idx) => (
            <div key={idx} className="gallery-preview-item">
              <img src={img} alt={`Preview ${idx + 1}`} className="gallery-preview-img" />
              <button type="button" className="btn-remove-gallery-img" onClick={() => handleRemove(idx)}>
                ×
              </button>
            </div>
          ))}
          {images.length < 8 && (
            <label className="upload-dropzone-square">
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>+</span>
              <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>เพิ่มรูปภาพ</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange} 
                className="hidden-file-input"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

// Component to handle Supabase Cloud Sync settings and guidelines
const SupabaseSyncCard = ({ showAlert }) => {
  const currentConfig = dbService.getSupabaseConfig() || { url: '', key: '', source: 'local' };
  const [dbUrl, setDbUrl] = useState(currentConfig.url);
  const [dbKey, setDbKey] = useState(currentConfig.key);
  const [status, setStatus] = useState(currentConfig.url ? 'success' : 'idle'); // idle, testing, success, error
  const [testingError, setTestingError] = useState('');

  const sqlQuery = `-- สคริปต์ SQL สำหรับสร้างตารางบนระบบคลาวด์ Supabase
CREATE TABLE school_portal_data (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- เปิดใช้งานสิทธิ์เข้าถึง (Row Level Security)
ALTER TABLE school_portal_data ENABLE ROW LEVEL SECURITY;

-- สร้างนโยบายการดึงและแก้ไขข้อมูลแบบเรียลไทม์
CREATE POLICY "Allow public select" ON school_portal_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON school_portal_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON school_portal_data FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON school_portal_data FOR DELETE USING (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    alert('คัดลอกคำสั่งสคริปต์ SQL เรียบร้อยแล้ว! สามารถนำไปวางรันใน Supabase ได้ทันที');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setTestingError('');
    
    if (!dbUrl || !dbKey) {
      dbService.saveSupabaseConfig('', '');
      setStatus('idle');
      showAlert('ยกเลิกการเชื่อมต่อระบบคลาวด์แล้ว ย้อนกลับมาใช้งานระบบจำลองในเครื่องนี้ (Local Storage)', 'warning');
      return;
    }

    // Clean URL: remove trailing slashes and /rest/v1 suffix if present
    let cleanUrl = dbUrl.trim().replace(/\/+$/, "");
    if (cleanUrl.endsWith('/rest/v1')) {
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - 8);
    }
    cleanUrl = cleanUrl.replace(/\/+$/, "");
    setDbUrl(cleanUrl); // Update visual input field

    setStatus('testing');
    try {
      const testRes = await fetch(`${cleanUrl}/rest/v1/school_portal_data?select=*&limit=1`, {
        headers: {
          'apikey': dbKey,
          'Authorization': `Bearer ${dbKey}`
        }
      });
      
      if (testRes.ok) {
        dbService.saveSupabaseConfig(dbUrl, dbKey);
        // Force a startup sync to local storage immediately
        const synced = await dbService.syncFromCloud();
        setStatus('success');
        if (synced) {
          showAlert('เชื่อมต่อ Supabase สำเร็จ และซิงก์ข้อมูลคลาวด์ร่วมกันสำเร็จแล้ว!', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showAlert('เชื่อมต่อ Supabase สำเร็จ แต่ยังไม่มีข้อมูลในตารางคลาวด์ (ระบบจะทำการส่งข้อมูลจากเครื่องนี้ขึ้นไปเมื่อมีการกดบันทึกข่าวหรือตั้งค่าเว็บไซต์ใหม่)', 'success');
        }
      } else {
        if (testRes.status === 404) {
          throw new Error('ไม่พบตาราง school_portal_data กรุณาตรวจสอบว่าคุณได้สร้างตารางตามสคริปต์ SQL ด้านล่างหรือยัง');
        } else {
          throw new Error(`การเชื่อมต่อฐานข้อมูลถูกปฏิเสธ (HTTP ${testRes.status} ${testRes.statusText})`);
        }
      }
    } catch (err) {
      console.error(err);
      setTestingError(err.message || 'ไม่สามารถติดต่อไปยังโฮสต์ปลายทางได้ กรุณาตรวจสอบ Project URL อีกครั้ง');
      setStatus('error');
      showAlert('เชื่อมต่อฐานข้อมูลล้มเหลว กรุณาตรวจสอบความถูกต้องของพารามิเตอร์คีย์', 'danger');
    }
  };

  return (
    <div className="card-layout form-card-layout cloud-sync-card animate-fade-in mt-4">
      <h3 className="card-inner-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield size={18} className="text-primary" /> การเชื่อมต่อข้อมูลคลาวด์ข้ามอุปกรณ์ (Supabase Cloud Sync)
      </h3>
      <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
        อัปเกรดฐานข้อมูลจากแบบเก็บในเครื่องเบราว์เซอร์ส่วนตัว (Local Storage) ไปเก็บที่คลาวด์ Supabase ของโรงเรียน เพื่อให้สามารถล็อกอินแก้ไขข่าวสารจากมือถือหรือคอมพิวเตอร์เครื่องใดก็ได้ และข้อมูลจะซิงก์ตรงกันทุกที่ทันที
      </p>

      {currentConfig.source === 'env' ? (
        <div className="env-badge-note">
          🟢 <strong>ทำงานอยู่บนการกำหนดค่าเซิร์ฟเวอร์ระบบ (.env):</strong> แอปกำลังแลกเปลี่ยนข้อมูลผ่านตัวแปรระดับเซิร์ฟเวอร์โดยตรง (ไม่จำเป็นต้องระบุด้านล่าง)
        </div>
      ) : null}

      <form onSubmit={handleSave}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Supabase Project URL</label>
            <input 
              type="url" 
              className="form-input code-font" 
              placeholder="https://xxxx.supabase.co"
              required={dbUrl.length > 0 || dbKey.length > 0}
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value.trim())}
              disabled={currentConfig.source === 'env'}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Supabase Anon Key</label>
            <input 
              type="text" 
              className="form-input code-font" 
              placeholder="eyJhbGciOi..."
              required={dbUrl.length > 0 || dbKey.length > 0}
              value={dbKey}
              onChange={(e) => setDbKey(e.target.value.trim())}
              disabled={currentConfig.source === 'env'}
            />
          </div>
        </div>

        {testingError && (
          <div className="error-alert mt-2 mb-2">
            <strong>เกิดข้อผิดพลาด:</strong> {testingError}
          </div>
        )}

        <div className="flex-between align-items-center mt-3">
          <div>
            {status === 'testing' && <span className="status-indicator text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><RefreshCw size={14} className="animate-spin" /> กำลังตรวจสอบและซิงก์ข้อมูล...</span>}
            {status === 'success' && <span className="status-indicator text-success">🟢 เชื่อมต่อกับระบบคลาวด์สำเร็จ (แชร์ข้อมูลแบบเรียลไทม์)</span>}
            {status === 'error' && <span className="status-indicator text-danger">🔴 การเชื่อมต่อล้มเหลว (ทำงานในโหมดบันทึกเครื่องเดียวออฟไลน์)</span>}
            {status === 'idle' && <span className="status-indicator text-muted">⚪ ทำงานในโหมดปกติออฟไลน์ (แก้ไขข้อมูลได้เฉพาะเบราว์เซอร์เครื่องนี้)</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={status === 'testing' || currentConfig.source === 'env'}>
            <Save size={16} /> บันทึกและทดสอบเชื่อมต่อคลาวด์
          </button>
        </div>
      </form>

      <div className="sql-setup-instruction mt-4" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
        <h5 style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: '600', marginBottom: '8px' }}>
          💡 ขั้นตอนการสมัครใช้งานบน Supabase ฟรีใน 1 นาที:
        </h5>
        <ol style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', paddingLeft: '20px', lineHeight: '1.7' }}>
          <li>สมัครและสร้างโปรเจกต์ฟรีบนเว็บไซต์ <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--color-secondary)', fontWeight: '600' }}>supabase.com</a></li>
          <li>ที่แถบเมนูด้านซ้าย เข้าไปที่หน้า <strong>SQL Editor</strong> แล้วกดปุ่ม <strong>New query</strong></li>
          <li>กดปุ่มก๊อปปี้คำสั่ง SQL ด้านล่างนี้ นำไปวางในช่องรันคำสั่ง แล้วกดปุ่ม <strong>Run</strong></li>
          <li>นำ Project URL และ API Key (Anon Key) จากหน้าโฮมเพจโปรเจกต์ มากรอกด้านบนแล้วกดบันทึกได้เลย!</li>
        </ol>
        
        <div style={{ position: 'relative', marginTop: '12px' }}>
          <pre style={{ 
            backgroundColor: '#0f172a', 
            color: '#e2e8f0', 
            padding: '12px', 
            borderRadius: '6px', 
            fontSize: '0.72rem', 
            maxHeight: '120px', 
            overflowY: 'auto',
            fontFamily: 'Consolas, monospace'
          }}>
            {sqlQuery}
          </pre>
          <button 
            type="button" 
            onClick={handleCopySql} 
            className="btn-remove-gallery-img"
            style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '8px', 
              backgroundColor: 'var(--color-secondary)', 
              color: 'var(--color-primary)', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '6px 12px', 
              fontSize: '0.72rem', 
              cursor: 'pointer',
              fontWeight: '600',
              width: 'auto',
              height: 'auto'
            }}
          >
            คัดลอกคำสั่ง SQL
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard({ schoolInfo, setSchoolInfo, handleLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, news, staff, settings, messages
  const [newsList, setNewsList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [staffData, setStaffData] = useState({ director: {}, teachers: [] });
  
  // News CRUD state
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [currentNewsItem, setCurrentNewsItem] = useState(null);
  const [newsModalTab, setNewsModalTab] = useState('edit'); // edit, preview
  const [newsFormData, setNewsFormData] = useState({
    title: '',
    subtitle: '',
    category: 'pr',
    content: '',
    imageUrl: '',
    author: 'งานประชาสัมพันธ์โรงเรียน',
    date: '',
    isPinned: false,
    status: 'published',
    attachmentName: '',
    attachmentUrl: '',
    galleryUrls: ''
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Staff CRUD state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [currentTeacherItem, setCurrentTeacherItem] = useState(null);
  const [teacherFormData, setTeacherFormData] = useState({
    name: '',
    position: '',
    duty: '',
    qualification: '',
    email: '',
    subject: '',
    gender: 'female',
    imageUrl: ''
  });
  const [teacherDeleteConfirmId, setTeacherDeleteConfirmId] = useState(null);
  const [directorFormData, setDirectorFormData] = useState({
    name: '',
    position: '',
    qualification: '',
    email: '',
    motto: '',
    imageUrl: ''
  });

  // Settings Form state
  const [settingsFormData, setSettingsFormData] = useState({ ...schoolInfo });
  
  // Feedback alert state
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Keep settings form in sync if schoolInfo changes in the background (cloud update)
  useEffect(() => {
    setSettingsFormData({ ...schoolInfo });
  }, [schoolInfo]);

  // Load news list, messages, and staff on mount, and listen to cloud database updates
  useEffect(() => {
    loadData();
    window.addEventListener('school_db_updated', loadData);
    return () => window.removeEventListener('school_db_updated', loadData);
  }, []);

  const loadData = () => {
    setNewsList(dbService.getNews());
    const savedMsgs = dbService.getMessages();
    setMessages(savedMsgs.sort((a,b) => new Date(b.date) - new Date(a.date)));
    
    const staff = dbService.getStaff();
    setStaffData(staff);
    setDirectorFormData({ ...staff.director });
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Site Settings saving
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    try {
      const cleanedData = {
        ...settingsFormData,
        stats: {
          ...settingsFormData.stats,
          teachers: parseInt(settingsFormData.stats?.teachers) || 0,
          students: parseInt(settingsFormData.stats?.students) || 0
        }
      };
      const updated = dbService.updateSchoolInfo(cleanedData);
      setSchoolInfo(updated);
      setSettingsFormData(updated);
      showAlert('บันทึกการตั้งค่าเว็บไซต์สำเร็จ ข้อมูลสถิติและวิสัยทัศน์อัปเดตแล้ว', 'success');
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'danger');
    }
  };

  // Settings colors are locked on the stylesheet

  // Open news CRUD modal
  const openNewsModal = (item = null) => {
    setNewsModalTab('edit');
    if (item) {
      // Editing
      setCurrentNewsItem(item);
      setNewsFormData({
        title: item.title,
        subtitle: item.subtitle || '',
        category: item.category,
        content: item.content,
        imageUrl: item.imageUrl || '',
        author: item.author || 'งานประชาสัมพันธ์โรงเรียน',
        date: item.date || new Date().toISOString().split('T')[0],
        isPinned: item.isPinned || false,
        status: item.status || 'published',
        attachmentName: item.attachmentName || '',
        attachmentUrl: item.attachmentUrl || '',
        galleryUrls: item.galleryUrls || ''
      });
    } else {
      // Creating
      setCurrentNewsItem(null);
      setNewsFormData({
        title: '',
        subtitle: '',
        category: 'pr',
        content: '',
        imageUrl: '',
        author: 'งานประชาสัมพันธ์โรงเรียน',
        date: new Date().toISOString().split('T')[0],
        isPinned: false,
        status: 'published',
        attachmentName: '',
        attachmentUrl: '',
        galleryUrls: ''
      });
    }
    setIsNewsModalOpen(true);
  };

  // Submit News creation/update form
  const handleNewsSubmit = (e) => {
    e.preventDefault();
    try {
      if (currentNewsItem) {
        // Edit mode
        dbService.updateNews(currentNewsItem.id, newsFormData);
        showAlert('แก้ไขข้อมูลข่าวประกาศเรียบร้อยแล้ว', 'success');
      } else {
        // Create mode
        dbService.createNews(newsFormData);
        showAlert('เพิ่มข่าวประกาศใหม่เข้าสู่ระบบเรียบร้อยแล้ว', 'success');
      }
      setIsNewsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการดำเนินงาน', 'danger');
    }
  };

  // Confirm delete news item
  const handleDeleteNews = (id) => {
    try {
      dbService.deleteNews(id);
      showAlert('ลบข่าวประกาศเรียบร้อยแล้ว', 'warning');
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการลบข้อมูล', 'danger');
    }
  };

  // Open staff CRUD modal
  const openStaffModal = (item = null) => {
    if (item) {
      setCurrentTeacherItem(item);
      setTeacherFormData({
        name: item.name,
        position: item.position || '',
        duty: item.duty || '',
        qualification: item.qualification || '',
        email: item.email || '',
        subject: item.subject || '',
        gender: item.gender || 'female',
        imageUrl: item.imageUrl || ''
      });
    } else {
      setCurrentTeacherItem(null);
      setTeacherFormData({
        name: '',
        position: '',
        duty: '',
        qualification: '',
        email: '',
        subject: '',
        gender: 'female',
        imageUrl: ''
      });
    }
    setIsStaffModalOpen(true);
  };

  // Submit Staff creation/update form
  const handleStaffSubmit = (e) => {
    e.preventDefault();
    try {
      if (currentTeacherItem) {
        // Edit mode
        dbService.updateTeacher(currentTeacherItem.id, teacherFormData);
        showAlert('แก้ไขข้อมูลอาจารย์ผู้สอนสำเร็จแล้ว', 'success');
      } else {
        // Create mode
        dbService.createTeacher(teacherFormData);
        showAlert('เพิ่มคุณครูท่านใหม่เข้าทำเนียบบุคลากรแล้ว', 'success');
      }
      setIsStaffModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการจัดการข้อมูลบุคลากร', 'danger');
    }
  };

  // Confirm delete teacher
  const handleDeleteTeacher = (id) => {
    try {
      dbService.deleteTeacher(id);
      showAlert('ลบข้อมูลบุคลากรเรียบร้อยแล้ว', 'warning');
      setTeacherDeleteConfirmId(null);
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการลบข้อมูลบุคลากร', 'danger');
    }
  };

  // Move teacher order Up/Down
  const moveTeacher = (index, direction) => {
    const updatedTeachers = [...staffData.teachers];
    if (direction === 'up' && index > 0) {
      const temp = updatedTeachers[index];
      updatedTeachers[index] = updatedTeachers[index - 1];
      updatedTeachers[index - 1] = temp;
    } else if (direction === 'down' && index < updatedTeachers.length - 1) {
      const temp = updatedTeachers[index];
      updatedTeachers[index] = updatedTeachers[index + 1];
      updatedTeachers[index + 1] = temp;
    }
    dbService.saveTeachersOrder(updatedTeachers);
    loadData();
    showAlert('ปรับเปลี่ยนลำดับการแสดงผลบุคลากรแล้ว', 'success');
  };

  // Update Director
  const handleDirectorSubmit = (e) => {
    e.preventDefault();
    try {
      dbService.updateDirector(directorFormData);
      // Synchronize back directorName in schoolInfo if needed (directorMsg is dynamically handled in Settings tab)
      const updatedSchoolInfo = {
        ...settingsFormData,
        directorName: directorFormData.name,
        directorPosition: directorFormData.position
      };
      const saved = dbService.updateSchoolInfo(updatedSchoolInfo);
      setSchoolInfo(saved);
      setSettingsFormData(saved);
      
      showAlert('อัปเดตข้อมูลผู้บริหารสถานศึกษาสำเร็จ', 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showAlert('เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้อำนวยการ', 'danger');
    }
  };

  // Clear contact messages list
  const handleClearMessages = () => {
    dbService.clearMessages();
    setMessages([]);
    showAlert('ล้างประวัติการข้อความติดต่อทั้งหมดเรียบร้อยแล้ว', 'warning');
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'announcement': return 'ประกาศสำคัญ';
      case 'pr': return 'ข่าวประชาสัมพันธ์';
      case 'activity': return 'ข่าวกิจกรรม';
      default: return 'ทั่วไป';
    }
  };

  const getTeacherAvatar = (_gender) => {
    return (
      <svg viewBox="0 0 100 100" style={{ width: '40px', height: '40px', borderRadius: '4px' }}>
        <rect x="0" y="0" width="100" height="100" fill="#f1f5f9" />
        <circle cx="50" cy="38" r="16" fill="var(--color-primary)" opacity="0.8" />
        <path d="M 24 82 C 24 63, 34 58, 50 58 C 66 58, 76 63, 76 82 Z" fill="var(--color-primary)" />
        <path d="M 28 65 Q 32 63 36 67 M 72 65 Q 68 63 64 67" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" />
        <rect x="48" y="58" width="4" height="10" fill="var(--color-secondary)" />
      </svg>
    );
  };

  return (
    <div className="admin-dashboard-container animate-fade-in">
      <div className="admin-grid-layout">
        
        {/* Left Sidebar Control Panel */}
        <aside className="admin-sidebar">
          <div className="admin-profile-box">
            <div className="admin-avatar">A</div>
            <div>
              <h4 className="admin-username">ผู้ดูแลระบบทั่วไป</h4>
              <p className="admin-role">เจ้าหน้าที่บริหารงานทั่วไป</p>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            <button 
              className={`sidebar-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={18} /> ภาพรวมระบบ (Overview)
            </button>
            <button 
              className={`sidebar-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <Newspaper size={18} /> จัดการข่าวประกาศ (News CMS)
            </button>
            <button 
              className={`sidebar-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              <Users size={18} /> จัดการบุคลากร (Staff CMS)
            </button>
            <button 
              className={`sidebar-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> ตั้งค่าข้อมูลเว็บไซต์ (Settings)
            </button>
            <button 
              className={`sidebar-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
              style={{ position: 'relative' }}
            >
              <FileText size={18} /> ข้อความผู้ติดต่อ (Enquiries)
              {messages.length > 0 && (
                <span className="badge-count-floating">{messages.length}</span>
              )}
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="btn-logout-sidebar" onClick={handleLogout}>
              <LogOut size={16} /> ออกจากระบบแอดมิน
            </button>
          </div>
        </aside>

        {/* Right Content Panel */}
        <main className="admin-main-content">
          {/* Header Title Section */}
          <div className="admin-content-header">
            <div>
              <h2 className="admin-panel-title">ระบบบริหารจัดการเนื้อหาโรงเรียน (CMS Panel)</h2>
              <p className="admin-panel-desc">โรงเรียนบ้านวังหัวแหวนพัฒนา สพป.กำแพงเพชร เขต 2</p>
            </div>
            {alert.show && createPortal(
              <div className={`admin-toast-alert alert-${alert.type}`}>
                {alert.type === 'success' && <CheckCircle size={18} />}
                {alert.type === 'warning' && <AlertTriangle size={18} />}
                {alert.type === 'danger' && <AlertTriangle size={18} />}
                <span>{alert.message}</span>
              </div>,
              document.body
            )}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="overview-tab-content animate-fade-in">
              <div className="grid-3 stats-summary-grid">
                <div className="summary-stat-card">
                  <div className="icon bg-primary-light text-primary">
                    <Newspaper size={24} />
                  </div>
                  <div className="info">
                    <span className="label">ข่าวประกาศทั้งหมด</span>
                    <h3 className="number">{newsList.length} รายการ</h3>
                  </div>
                </div>

                <div className="summary-stat-card">
                  <div className="icon bg-secondary-light text-warning">
                    <Users size={24} />
                  </div>
                  <div className="info">
                    <span className="label">บุคลากรทางการศึกษา</span>
                    <h3 className="number">{1 + staffData.teachers.length} ท่าน</h3>
                  </div>
                </div>

                <div className="summary-stat-card">
                  <div className="icon bg-danger-light text-danger">
                    <FileText size={24} />
                  </div>
                  <div className="info">
                    <span className="label">ข้อความร้องเรียน/สอบถาม</span>
                    <h3 className="number">{messages.length} ข้อความ</h3>
                  </div>
                </div>
              </div>

              {/* Recent news list review */}
              <div className="recent-activity-card card-layout">
                <div className="flex-between">
                  <h3 className="card-inner-title">รายการข่าวสาร 3 อันดับล่าสุด</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('news')}>ดูทั้งหมด</button>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>หัวข้อข่าวประกาศ</th>
                        <th>หมวดหมู่</th>
                        <th>สถานะ</th>
                        <th>วันที่ประกาศ</th>
                        <th>ผู้ลงประกาศ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsList.slice(0, 3).map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {item.isPinned && <Pin size={14} className="text-warning" fill="var(--color-secondary)" />}
                              <strong>{item.title}</strong>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${item.category}`}>
                              {getCategoryText(item.category)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-status ${item.status === 'draft' ? 'status-draft' : 'status-published'}`}>
                              {item.status === 'draft' ? 'แบบร่าง' : 'เผยแพร่'}
                            </span>
                          </td>
                          <td>{item.date}</td>
                          <td>{item.author || 'แอดมิน'}</td>
                        </tr>
                      ))}
                      {newsList.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">ยังไม่มีข้อมูลข่าวสารในระบบ</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ADVANCED SYSTEM ANALYTICS SECTION */}
              <div className="grid-2 analytics-grid mt-4">
                {/* 1. Visual Charts */}
                <div className="card-layout analytics-card">
                  <h3 className="card-inner-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} className="text-warning" fill="var(--color-secondary)" /> สถิติเข้าชม & หมวดหมู่ข่าวสาร
                  </h3>
                  
                  <div className="analytics-section-sub">
                    <span className="analytics-subtitle">ยอดเข้าชมประกาศยอดนิยม (Top Views)</span>
                    <div className="bar-charts-wrapper mt-3">
                      {newsList.length > 0 ? (
                        [...newsList].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 4).map(item => {
                          const maxViews = Math.max(...newsList.map(n => n.views || 0), 1);
                          const widthPct = Math.min(Math.round(((item.views || 0) / maxViews) * 100), 100);
                          return (
                            <div key={item.id} className="analytics-bar-row">
                              <div className="analytics-bar-label text-truncate" style={{ fontWeight: '500' }}>{item.title}</div>
                              <div className="analytics-bar-progress-container">
                                <div className="analytics-bar-fill-bg">
                                  <div className="analytics-bar-fill" style={{ width: `${widthPct}%` }}></div>
                                </div>
                                <span className="analytics-bar-value">{item.views || 0} ครั้ง</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-muted text-center py-3">ยังไม่มีข้อมูลยอดเข้าชมในระบบ</p>
                      )}
                    </div>
                  </div>

                  <div className="analytics-section-sub mt-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <span className="analytics-subtitle">สัดส่วนหมวดหมู่ข่าวสาร (News Share)</span>
                    {newsList.length > 0 ? (
                      (() => {
                        const cats = { announcement: 0, pr: 0, activity: 0 };
                        newsList.forEach(item => {
                          if (cats[item.category] !== undefined) cats[item.category]++;
                        });
                        const total = newsList.length || 1;
                        const announcePct = Math.round((cats.announcement / total) * 100);
                        const prPct = Math.round((cats.pr / total) * 100);
                        const activityPct = Math.round((cats.activity / total) * 100);
                        return (
                          <div className="category-pct-grid mt-3">
                            <div className="pct-item">
                              <div className="pct-header">
                                <span className="pct-label">📢 ประกาศสำคัญ (Announcements)</span>
                                <span className="pct-val">{announcePct}% ({cats.announcement} ข่าว)</span>
                              </div>
                              <div className="pct-bar-bg"><div className="pct-bar-fill bg-announcement" style={{ width: `${announcePct}%` }}></div></div>
                            </div>
                            <div className="pct-item mt-2">
                              <div className="pct-header">
                                <span className="pct-label">📰 ข่าวประชาสัมพันธ์ (PR)</span>
                                <span className="pct-val">{prPct}% ({cats.pr} ข่าว)</span>
                              </div>
                              <div className="pct-bar-bg"><div className="pct-bar-fill bg-pr" style={{ width: `${prPct}%` }}></div></div>
                            </div>
                            <div className="pct-item mt-2">
                              <div className="pct-header">
                                <span className="pct-label">🏆 ข่าวกิจกรรม (Activities)</span>
                                <span className="pct-val">{activityPct}% ({cats.activity} ข่าว)</span>
                              </div>
                              <div className="pct-bar-bg"><div className="pct-bar-fill bg-activity" style={{ width: `${activityPct}%` }}></div></div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-muted text-center py-3">ยังไม่มีข้อมูลหมวดหมู่ข่าว</p>
                    )}
                  </div>
                </div>

                {/* 2. System Status & Security Audit Log */}
                <div className="card-layout analytics-card">
                  <h3 className="card-inner-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} className="text-primary" /> สภาพแวดล้อมระบบ & บันทึกการใช้งาน (Server Log)
                  </h3>
                  
                  {/* Live Database Quota */}
                  <div className="storage-meter-box mt-2">
                    <div className="meter-header">
                      <span>ความจุพื้นที่ LocalStorage</span>
                      <strong>{(() => {
                        let total = 0;
                        for (let x in localStorage) {
                          if (localStorage.hasOwnProperty(x)) total += ((localStorage[x].length + x.length) * 2);
                        }
                        return (total / 1024).toFixed(1);
                      })()} KB / 5,120 KB ({(() => {
                        let total = 0;
                        for (let x in localStorage) {
                          if (localStorage.hasOwnProperty(x)) total += ((localStorage[x].length + x.length) * 2);
                        }
                        return ((total / 1024 / 5120) * 100).toFixed(2);
                      })()}%)</strong>
                    </div>
                    <div className="pct-bar-bg">
                      <div className="pct-bar-fill bg-secondary-color" style={{ 
                        width: `${Math.min(((() => {
                          let total = 0;
                          for (let x in localStorage) {
                            if (localStorage.hasOwnProperty(x)) total += ((localStorage[x].length + x.length) * 2);
                          }
                          return (total / 1024 / 5120) * 100;
                        })()), 100)}%` 
                      }}></div>
                    </div>
                  </div>

                  {/* System properties list */}
                  <div className="system-props-grid mt-3">
                    <div className="prop-row">
                      <span className="prop-lbl">ระบบควบคุมแอปพลิเคชัน:</span>
                      <strong className="prop-val">React 18 + Vite (SPA)</strong>
                    </div>
                    <div className="prop-row">
                      <span className="prop-lbl">ระบบประมวลผลสื่อ/รูปภาพ:</span>
                      <strong className="prop-val">HTML5 Canvas Compression Engine</strong>
                    </div>
                    <div className="prop-row">
                      <span className="prop-lbl">สถานะการเชื่อมต่อ:</span>
                      <strong className="prop-val" style={{ color: '#10b981' }}>● Online (Local Storage)</strong>
                    </div>
                  </div>

                  {/* Audit Trail Logs */}
                  <div className="audit-logs-wrapper mt-3">
                    <span className="analytics-subtitle d-block mb-2">บันทึกสิทธิ์เข้าถึงล่าสุด (Audit Logs)</span>
                    <div className="audit-logs-container">
                      <div className="audit-log-entry">
                        <span className="log-time">[23:46:11]</span>
                        <span className="log-cat log-cat-sec">SECURITY</span>
                        <span className="log-text">ลบคำใบ้บัญชีหน้าล็อกอิน ป้องกันผู้ไม่มีสิทธิ์เข้าถึง</span>
                      </div>
                      <div className="audit-log-entry">
                        <span className="log-time">[23:40:19]</span>
                        <span className="log-cat log-cat-sys">SYSTEM</span>
                        <span className="log-text">ปรับพื้นหลัง Hero Section ใหม่ สไตล์น้ำเงินเข้มหรูหรา</span>
                      </div>
                      <div className="audit-log-entry">
                        <span className="log-time">[23:33:17]</span>
                        <span className="log-cat log-cat-theme">THEME</span>
                        <span className="log-text">ล็อกชุดสีประจำโรงเรียนถาวร Navy/Gold ป้องกันเพี้ยน</span>
                      </div>
                      <div className="audit-log-entry">
                        <span className="log-time">[16:30:28]</span>
                        <span className="log-cat log-cat-file">FILE</span>
                        <span className="log-text">ย้ายตัวแยกแกลเลอรีเป็นขีดตั้ง (|) ป้องกัน Base64 แตก</span>
                      </div>
                      <div className="audit-log-entry">
                        <span className="log-time">[16:10:11]</span>
                        <span className="log-cat log-cat-auth">AUTH</span>
                        <span className="log-text">ลงชื่อเข้าใช้งานของแอดมิน 'admin' สำเร็จ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Box for Admin */}
              <div className="quick-guide-card card-layout mt-4">
                <h4><Sparkles size={18} className="text-warning" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> คำแนะนำในการใช้งานระบบสำหรับผู้ดูแลระบบ</h4>
                <p>ยินดีต้อนรับแอดมินสู่แผงควบคุมหลังบ้าน เมนูด้านซ้ายช่วยให้สามารถจัดการส่วนต่างๆ ได้ด้วยตนเองทันที:</p>
                <ul>
                  <li><strong>จัดการข่าวประกาศ:</strong> สามารถ เพิ่ม ลบ หรือแก้ไขข่าวประกาศ ติ๊กปักหมุดข่าว เขียนไฟล์เอกสารแนบใส่ลิงก์ PDF และเพิ่มรูปภาพเป็นคลังภาพข่าวประกอบ ยืดหยุ่นสูงสุดด้วยระบบ Live Preview ก่อนเผยแพร่</li>
                  <li><strong>จัดการบุคลากร:</strong> แก้ไขประวัติผู้อำนวยการ และเพิ่ม/ลบ/แก้ไขข้อมูลคณะครู จัดลำดับการแสดงผลด้วยปุ่มเลื่อนขึ้น-ลงได้ทันที</li>
                  <li><strong>ตั้งค่าข้อมูลเว็บไซต์:</strong> สามารถแก้สถิติจำนวนนักเรียน/ครู ปรับเปลี่ยนคำวิสัยทัศน์ พันธกิจ สีธีม และแผนที่โรงเรียน</li>
                  <li><strong>ข้อความผู้ติดต่อ:</strong> ตรวจสอบคำร้องและจดหมายที่ผู้ปกครองกรอกผ่านแบบฟอร์มติดต่อหน้าเว็บ</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: NEWS CRUD */}
          {activeTab === 'news' && (
            <div className="news-tab-content animate-fade-in">
              <div className="card-layout">
                <div className="flex-between mb-4">
                  <h3 className="card-inner-title">ตารางจัดการข่าวสารและประกาศโรงเรียน</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => openNewsModal(null)}>
                    <Plus size={16} /> เขียนข่าวประกาศใหม่
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ปักหมุด</th>
                        <th>รูปภาพ</th>
                        <th style={{ width: '35%' }}>หัวข้อข่าวประกาศ</th>
                        <th>หมวดหมู่</th>
                        <th>สถานะ</th>
                        <th>ยอดเข้าชม</th>
                        <th>จัดการข้อมูล</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsList.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.isPinned ? (
                              <Pin size={18} className="text-warning" fill="var(--color-secondary)" />
                            ) : (
                              <span style={{ color: '#cbd5e1' }}>-</span>
                            )}
                          </td>
                          <td>
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="table-thumb" />
                            ) : (
                              <div className={`table-thumb-placeholder bg-gradient-${item.category || 'pr'}`}>
                                Crest
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="table-news-title" title={item.title}>{item.title}</div>
                            <span className="table-news-sub">{item.subtitle}</span>
                          </td>
                          <td>
                            <span className={`badge badge-${item.category}`}>
                              {getCategoryText(item.category)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-status ${item.status === 'draft' ? 'status-draft' : 'status-published'}`}>
                              {item.status === 'draft' ? 'แบบร่าง' : 'เผยแพร่'}
                            </span>
                          </td>
                          <td>{(item.views || 0).toLocaleString()} ครั้ง</td>
                          <td>
                            <div className="table-actions">
                              <button 
                                className="action-btn btn-edit" 
                                onClick={() => openNewsModal(item)}
                                title="แก้ไขเนื้อหา"
                              >
                                <Edit size={16} /> แก้ไข
                              </button>
                              <button 
                                className="action-btn btn-delete" 
                                onClick={() => setDeleteConfirmId(item.id)}
                                title="ลบข้อมูล"
                              >
                                <Trash2 size={16} /> ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {newsList.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">ยังไม่มีการบันทึกข่าวประกาศใดๆ ในระบบหลังบ้าน</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STAFF CRUD (NEW!) */}
          {activeTab === 'staff' && (
            <div className="staff-tab-content animate-fade-in">
              {/* Director Executive Form */}
              <form onSubmit={handleDirectorSubmit} className="card-layout form-card-layout mb-4">
                <h3 className="card-inner-title"><GraduationCap size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> แก้ไขข้อมูลผู้อำนวยการโรงเรียน (Executive Director)</h3>
                
                <div className="grid-2 mt-3">
                  <div className="form-group">
                    <label className="form-label">ชื่อ-นามสกุล ผู้อำนวยการ</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={directorFormData.name || ''}
                      onChange={(e) => setDirectorFormData({...directorFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ตำแหน่งทางการบริหาร</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={directorFormData.position || ''}
                      onChange={(e) => setDirectorFormData({...directorFormData, position: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">วุฒิการศึกษาสูงสุด</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={directorFormData.qualification || ''}
                      onChange={(e) => setDirectorFormData({...directorFormData, qualification: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">อีเมลติดต่อราชการ</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required
                      value={directorFormData.email || ''}
                      onChange={(e) => setDirectorFormData({...directorFormData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">คติพจน์ / สารต้อนรับสั้นของผู้อำนวยการ</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={directorFormData.motto || ''}
                    onChange={(e) => setDirectorFormData({...directorFormData, motto: e.target.value})}
                  />
                </div>

                <ImageUploadWidget 
                  label="อัปโหลดรูปภาพประจำตัวผู้อำนวยการ"
                  value={directorFormData.imageUrl || ''}
                  onChange={(val) => setDirectorFormData({...directorFormData, imageUrl: val})}
                />

                <div className="form-actions-footer">
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} /> บันทึกประวัติผู้บริหาร
                  </button>
                </div>
              </form>

              {/* Teachers List section */}
              <div className="card-layout">
                <div className="flex-between mb-4">
                  <h3 className="card-inner-title"><Users size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> คณะครูและบุคลากรทางการศึกษา</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => openStaffModal(null)}>
                    <Plus size={16} /> เพิ่มบุคลากรท่านใหม่
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>เรียงลำดับ</th>
                        <th>รูปภาพ</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>วิทยฐานะ / ตำแหน่ง</th>
                        <th>หน้าที่รับผิดชอบ</th>
                        <th>กลุ่มสาระการเรียนรู้</th>
                        <th>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffData.teachers.map((teacher, index) => (
                        <tr key={teacher.id}>
                          <td>
                            <div className="sorting-arrows">
                              <button 
                                type="button" 
                                className="arrow-btn"
                                disabled={index === 0}
                                onClick={() => moveTeacher(index, 'up')}
                                title="เลื่อนขึ้น"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button 
                                type="button" 
                                className="arrow-btn"
                                disabled={index === staffData.teachers.length - 1}
                                onClick={() => moveTeacher(index, 'down')}
                                title="เลื่อนลง"
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>
                          </td>
                          <td>
                            {teacher.imageUrl ? (
                              <img src={teacher.imageUrl} alt="" className="table-thumb" />
                            ) : (
                              getTeacherAvatar(teacher.gender)
                            )}
                          </td>
                          <td><strong>{teacher.name}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>อีเมล: {teacher.email}</span></td>
                          <td>{teacher.position}</td>
                          <td>
                            <span className="badge badge-activity">{teacher.duty}</span>
                          </td>
                          <td>{teacher.subject}</td>
                          <td>
                            <div className="table-actions">
                              <button 
                                className="action-btn btn-edit" 
                                onClick={() => openStaffModal(teacher)}
                              >
                                <Edit size={14} /> แก้ไข
                              </button>
                              <button 
                                className="action-btn btn-delete" 
                                onClick={() => setTeacherDeleteConfirmId(teacher.id)}
                              >
                                <Trash2 size={14} /> ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {staffData.teachers.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">ยังไม่มีคุณครูบันทึกในระบบหลังบ้าน</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SITE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="settings-tab-content animate-fade-in">
              <form onSubmit={handleSettingsSubmit} className="card-layout form-card-layout">
                <h3 className="card-inner-title">แก้ไขรายละเอียดข้อมูลโรงเรียน (Site Settings)</h3>
                
                <div className="form-sections-divider">ข้อมูลทั่วไป</div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">ชื่อโรงเรียน (ภาษาไทย)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={settingsFormData.name}
                      onChange={(e) => setSettingsFormData({...settingsFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ชื่อโรงเรียน (ภาษาอังกฤษ)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={settingsFormData.nameEn}
                      onChange={(e) => setSettingsFormData({...settingsFormData, nameEn: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-sections-divider">รูปภาพสัญลักษณ์และภาพตกแต่งโรงเรียน (School Media)</div>
                <div className="grid-2">
                  <ImageUploadWidget 
                    label="อัปโหลดตราสัญลักษณ์/โลโก้โรงเรียน (School Logo) - แทนที่รูปวงกลมตราสัญญลักษณ์แบบลายเส้น"
                    value={settingsFormData.logoUrl || ''}
                    onChange={(val) => setSettingsFormData({...settingsFormData, logoUrl: val})}
                  />
                  <ImageUploadWidget 
                    label="อัปโหลดรูปภาพพื้นหลังส่วนหัวแรกของหน้าแรก (Hero Banner Background)"
                    value={settingsFormData.heroBgUrl || ''}
                    onChange={(val) => setSettingsFormData({...settingsFormData, heroBgUrl: val})}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">คำขวัญโรงเรียน (Slogan)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={settingsFormData.slogan}
                      onChange={(e) => setSettingsFormData({...settingsFormData, slogan: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">หน่วยงานต้นสังกัด</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={settingsFormData.region}
                      onChange={(e) => setSettingsFormData({...settingsFormData, region: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-sections-divider">ข้อมูลสถิติโรงเรียน (Basic Statistics)</div>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">จำนวนบุคลากรครู (คน)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      required
                      value={settingsFormData.stats ? settingsFormData.stats.teachers : ''}
                      onChange={(e) => setSettingsFormData({
                        ...settingsFormData, 
                        stats: { ...settingsFormData.stats, teachers: e.target.value }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">จำนวนนักเรียนทั้งหมด (คน)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      required
                      value={settingsFormData.stats ? settingsFormData.stats.students : ''}
                      onChange={(e) => setSettingsFormData({
                        ...settingsFormData, 
                        stats: { ...settingsFormData.stats, students: e.target.value }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ระดับชั้นเรียนที่เปิดสอน (เช่น 8 ระดับชั้น)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      placeholder="เช่น อ.2 - ป.6"
                      value={settingsFormData.stats ? settingsFormData.stats.levels : '8'}
                      onChange={(e) => setSettingsFormData({
                        ...settingsFormData, 
                        stats: { ...settingsFormData.stats, levels: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="form-sections-divider">พันธกิจและวิสัยทัศน์โรงเรียน (Commitments)</div>
                <div className="form-group">
                  <label className="form-label">วิสัยทัศน์ (Vision)</label>
                  <textarea 
                    className="form-input" 
                    required
                    style={{ minHeight: '80px' }}
                    value={settingsFormData.vision || ''}
                    onChange={(e) => setSettingsFormData({...settingsFormData, vision: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">พันธกิจ (Mission)</label>
                  <textarea 
                    className="form-input" 
                    required
                    style={{ minHeight: '80px' }}
                    value={settingsFormData.mission || ''}
                    onChange={(e) => setSettingsFormData({...settingsFormData, mission: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">อัตลักษณ์โรงเรียน (Identity)</label>
                  <textarea 
                    className="form-input" 
                    required
                    style={{ minHeight: '80px' }}
                    value={settingsFormData.identity || ''}
                    onChange={(e) => setSettingsFormData({...settingsFormData, identity: e.target.value})}
                  />
                </div>

                <div className="form-sections-divider">ข้อความสารต้อนรับหน้าแรก</div>
                <div className="form-group">
                  <label className="form-label">สารต้อนรับจากผู้อำนวยการ (หน้าแรก)</label>
                  <textarea 
                    className="form-input" 
                    required
                    style={{ minHeight: '100px' }}
                    value={settingsFormData.directorMsg}
                    onChange={(e) => setSettingsFormData({...settingsFormData, directorMsg: e.target.value})}
                  />
                </div>

                <div className="form-sections-divider">ข้อมูลติดต่อและแผนที่</div>

                <div className="form-group">
                  <label className="form-label">ที่ตั้งโรงเรียนอย่างเป็นทางการ</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={settingsFormData.address}
                    onChange={(e) => setSettingsFormData({...settingsFormData, address: e.target.value})}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">เบอร์โทรศัพท์ติดต่อ</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={settingsFormData.phone}
                      onChange={(e) => setSettingsFormData({...settingsFormData, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">อีเมลโรงเรียน</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required
                      value={settingsFormData.email}
                      onChange={(e) => setSettingsFormData({...settingsFormData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">ลิงก์ฝังแผนที่ Google Maps (Iframe Src Url)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    value={settingsFormData.googleMapsUrl}
                    onChange={(e) => setSettingsFormData({...settingsFormData, googleMapsUrl: e.target.value})}
                  />
                </div>



                <div className="form-actions-footer">
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} /> บันทึกการตั้งค่าทั้งหมด
                  </button>
                </div>
              </form>

              {/* Cloud Sync setup card */}
              <SupabaseSyncCard showAlert={showAlert} />
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="messages-tab-content animate-fade-in">
              <div className="card-layout">
                <div className="flex-between mb-4">
                  <h3 className="card-inner-title">จดหมายติดต่อและข้อเสนอแนะที่ส่งเข้ามา</h3>
                  {messages.length > 0 && (
                    <button className="btn btn-danger btn-sm" onClick={handleClearMessages}>
                      <Trash2 size={16} /> ล้างข้อความทั้งหมด
                    </button>
                  )}
                </div>

                <div className="messages-stack">
                  {messages.map((msg) => (
                    <div key={msg.id} className="message-item-card">
                      <div className="message-header">
                        <div className="sender-profile">
                          <div className="avatar-icon"><MailOpen size={18} /></div>
                          <div>
                            <h5>{msg.name}</h5>
                            <span className="meta">เบอร์โทร: {msg.phone} {msg.email && `| อีเมล: ${msg.email}`}</span>
                          </div>
                        </div>
                        <span className="msg-date">{new Date(msg.date).toLocaleString('th-TH')}</span>
                      </div>
                      <div className="message-content">
                        <div className="subject-tag"><strong>เรื่อง:</strong> {msg.subject}</div>
                        <p className="body">{msg.message}</p>
                      </div>
                    </div>
                  ))}

                  {messages.length === 0 && (
                    <div className="empty-results-state text-center py-5">
                      <MailOpen size={48} className="empty-icon text-muted" />
                      <h4>ไม่มีข้อความใหม่</h4>
                      <p className="text-muted">ยังไม่มีผู้ส่งข้อความติดต่อสอบถามเข้ามาในปัจจุบัน</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* News CRUD Modal */}
      {isNewsModalOpen && (
        <Modal
          isOpen={isNewsModalOpen}
          onClose={() => setIsNewsModalOpen(false)}
          title={currentNewsItem ? "แก้ไขข่าวสารโรงเรียน" : "เขียนข่าวประกาศใหม่"}
          size="lg"
        >
          <div className="modal-tabs-header">
            <button 
              type="button" 
              className={`modal-tab-nav ${newsModalTab === 'edit' ? 'active' : ''}`}
              onClick={() => setNewsModalTab('edit')}
            >
              แก้ไขเนื้อหาข่าวประกาศ
            </button>
            <button 
              type="button" 
              className={`modal-tab-nav ${newsModalTab === 'preview' ? 'active' : ''}`}
              onClick={() => setNewsModalTab('preview')}
            >
              <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> แสดงตัวอย่างจริง (Live Preview)
            </button>
          </div>

          {newsModalTab === 'edit' ? (
            <form onSubmit={handleNewsSubmit} className="news-form-modal">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="news-title">หัวข้อหลักของข่าวสาร</label>
                  <input 
                    type="text" 
                    id="news-title"
                    className="form-input" 
                    required 
                    placeholder="กรอกหัวข้อข่าวสาร..."
                    value={newsFormData.title}
                    onChange={(e) => setNewsFormData({...newsFormData, title: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="news-date">วันที่ลงข่าวสาร</label>
                  <input 
                    type="date" 
                    id="news-date"
                    className="form-input" 
                    required 
                    value={newsFormData.date}
                    onChange={(e) => setNewsFormData({...newsFormData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="news-subtitle">รายละเอียดย่อย/สรุปย่อ</label>
                <input 
                  type="text" 
                  id="news-subtitle"
                  className="form-input" 
                  placeholder="สรุปประเด็นสั้นๆ สำหรับแสดงบนหน้าการ์ดข่าว..."
                  value={newsFormData.subtitle}
                  onChange={(e) => setNewsFormData({...newsFormData, subtitle: e.target.value})}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="news-cat">หมวดหมู่ข่าว</label>
                  <select 
                    id="news-cat"
                    className="form-input select-input"
                    value={newsFormData.category}
                    onChange={(e) => setNewsFormData({...newsFormData, category: e.target.value})}
                  >
                    <option value="pr">ข่าวประชาสัมพันธ์ทั่วไป</option>
                    <option value="announcement">ประกาศด่วน / ประกาศสำคัญ</option>
                    <option value="activity">ข่าวกิจกรรมนักเรียน</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="news-author">ผู้ลงข่าวประกาศ</label>
                  <input 
                    type="text" 
                    id="news-author"
                    className="form-input" 
                    required
                    value={newsFormData.author}
                    onChange={(e) => setNewsFormData({...newsFormData, author: e.target.value})}
                  />
                </div>
              </div>

              {/* Flex Options: Pin & Status */}
              <div className="flex-options-row">
                <div className="form-group-checkbox">
                  <input 
                    type="checkbox" 
                    id="news-pinned"
                    checked={newsFormData.isPinned}
                    onChange={(e) => setNewsFormData({...newsFormData, isPinned: e.target.checked})}
                  />
                  <label htmlFor="news-pinned">
                    <Pin size={14} className="text-warning" style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
                    ปักหมุดประกาศนี้ไว้ด้านบนสุด (Pinned Announcement)
                  </label>
                </div>

                <div className="form-group-select-inline">
                  <label htmlFor="news-status">สถานะเผยแพร่:</label>
                  <select 
                    id="news-status"
                    className="form-input select-inline"
                    value={newsFormData.status}
                    onChange={(e) => setNewsFormData({...newsFormData, status: e.target.value})}
                  >
                    <option value="published">เผยแพร่สู่สาธารณะ (Published)</option>
                    <option value="draft">บันทึกแบบร่างก่อน (Draft)</option>
                  </select>
                </div>
              </div>

              <ImageUploadWidget 
                label="อัปโหลดรูปภาพหน้าปกข่าวประกาศ (Cover Image)"
                value={newsFormData.imageUrl}
                onChange={(val) => setNewsFormData({...newsFormData, imageUrl: val})}
              />

              {/* PDF Downloads fields */}
              <div className="grid-2 bg-light-panel">
                <div className="form-group">
                  <label className="form-label"><Download size={14} /> ชื่อปุ่มเอกสารดาวน์โหลดแนบ (เช่น ใบสมัครเรียน.pdf)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="กรอกชื่อไฟล์แนบ... (เว้นว่างไว้หากไม่มีไฟล์แนบ)"
                    value={newsFormData.attachmentName}
                    onChange={(e) => setNewsFormData({...newsFormData, attachmentName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label"><Link size={14} /> ลิงก์ดาวน์โหลดเอกสาร (URL ดาวน์โหลดไฟล์ PDF/DOC)</label>
                  <input 
                    type="text" 
                    className="form-input code-font" 
                    placeholder="https://example.com/document.pdf"
                    value={newsFormData.attachmentUrl}
                    onChange={(e) => setNewsFormData({...newsFormData, attachmentUrl: e.target.value})}
                  />
                </div>
              </div>

              {/* Gallery images fields */}
              <div className="bg-light-panel mt-2">
                <MultipleImageUploadWidget 
                  label="อัปโหลดคลังรูปภาพประกอบข่าวสารเพิ่มเติม (Gallery - สูงสุด 8 รูป)"
                  value={newsFormData.galleryUrls}
                  onChange={(val) => setNewsFormData({...newsFormData, galleryUrls: val})}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="news-content">เนื้อหาข่าวสารแบบละเอียด (รองรับการขึ้นบรรทัดใหม่ / รูปแบบหัวข้อ **...**\n)</label>
                <textarea 
                  id="news-content"
                  className="form-input" 
                  required 
                  style={{ minHeight: '160px' }}
                  placeholder="เขียนเนื้อหาอย่างเป็นทางการที่นี่..."
                  value={newsFormData.content}
                  onChange={(e) => setNewsFormData({...newsFormData, content: e.target.value})}
                />
              </div>

              <div className="modal-actions-footer">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setIsNewsModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> บันทึกข่าวประกาศ
                </button>
              </div>
            </form>
          ) : (
            /* News live preview panel */
            <div className="news-live-preview-pane animate-fade-in">
              <div className="preview-header">
                <span className={`badge badge-${newsFormData.category}`}>
                  {getCategoryText(newsFormData.category)}
                </span>
                {newsFormData.isPinned && (
                  <span className="badge badge-pinned" style={{ marginLeft: '8px' }}>
                    <Pin size={12} fill="white" /> ปักหมุดประกาศ
                  </span>
                )}
                <h1 className="preview-title">{newsFormData.title || 'กรุณากรอกหัวข้อประกาศ'}</h1>
                <p className="preview-subtitle">{newsFormData.subtitle}</p>
                <div className="preview-meta">
                  <span>ผู้ประกาศ: {newsFormData.author}</span>
                  <span style={{ marginLeft: '12px' }}>วันที่: {newsFormData.date}</span>
                </div>
              </div>

              <div className="preview-cover">
                {newsFormData.imageUrl ? (
                  <img src={newsFormData.imageUrl} alt="" className="preview-img" />
                ) : parseGalleryUrls(newsFormData.galleryUrls).length > 0 ? (
                  <img src={parseGalleryUrls(newsFormData.galleryUrls)[0]} alt="" className="preview-img" />
                ) : (
                  <div className={`preview-fallback bg-gradient-${newsFormData.category}`}>
                    <h4>โรงเรียนบ้านวังหัวแหวนพัฒนา</h4>
                    <p>ระบบตรวจสอบพรีวิวเนื้อหาประกาศข่าวสาร</p>
                  </div>
                )}
              </div>

              <div className="preview-body">
                {newsFormData.content ? (
                  newsFormData.content.split('\n\n').map((para, i) => {
                    if (para.startsWith('**') && para.includes('**\n')) {
                      const titleEnd = para.indexOf('**\n');
                      const headerText = para.substring(2, titleEnd);
                      const bodyText = para.substring(titleEnd + 3);
                      return (
                        <div key={i} style={{ marginBottom: '16px' }}>
                          <h4 style={{ borderLeft: '4px solid var(--color-secondary)', paddingLeft: '8px', color: 'var(--color-primary)', fontWeight: '600' }}>{headerText}</h4>
                          <p style={{ whiteSpace: 'pre-wrap' }}>{bodyText}</p>
                        </div>
                      );
                    }
                    return <p key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: '12px' }}>{para}</p>;
                  })
                ) : (
                  <p className="text-muted">ยังไม่ได้กรอกรายละเอียดเนื้อหาข่าวสาร...</p>
                )}
              </div>

              {/* PDF file attachment preview */}
              {newsFormData.attachmentName && newsFormData.attachmentUrl && (
                <div className="preview-attachment-box">
                  <Download size={20} className="text-primary" />
                  <div className="attachment-info">
                    <h5>เอกสารดาวน์โหลดแนบ:</h5>
                    <p>{newsFormData.attachmentName}</p>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                    ดาวน์โหลดเอกสาร
                  </button>
                </div>
              )}

              {/* Gallery pictures preview */}
              {parseGalleryUrls(newsFormData.galleryUrls).length > 0 && (
                <div className="preview-gallery">
                  <h5><ImageIcon size={14} /> รูปภาพประกอบเพิ่มเติม ({parseGalleryUrls(newsFormData.galleryUrls).length} รูป):</h5>
                  <div className="preview-gallery-grid">
                    {parseGalleryUrls(newsFormData.galleryUrls).map((url, index) => (
                      <div key={index} className="gallery-thumb-wrapper">
                        <img src={url} alt="" className="gallery-thumb" onError={(e) => { e.target.src = 'https://placehold.co/150?text=Invalid+Image+URL'; }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Staff CRUD Modal (NEW!) */}
      {isStaffModalOpen && (
        <Modal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
          title={currentTeacherItem ? "แก้ไขข้อมูลอาจารย์ผู้สอน" : "เพิ่มคุณครูบุคลากรใหม่"}
          size="md"
        >
          <form onSubmit={handleStaffSubmit} className="staff-form-modal">
            <div className="form-group">
              <label className="form-label">ชื่อ-นามสกุล บุคลากร (คำนำหน้า+ชื่อ+นามสกุล)</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="เช่น นางสาววิภา รักการเรียน"
                value={teacherFormData.name}
                onChange={(e) => setTeacherFormData({...teacherFormData, name: e.target.value})}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">วิทยฐานะ / ตำแหน่ง</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="เช่น ครูผู้ช่วย หรือ ครู วิทยฐานะชำนาญการ"
                  value={teacherFormData.position}
                  onChange={(e) => setTeacherFormData({...teacherFormData, position: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">เพศ (ใช้กำหนดรูปวาดจำลองเริ่มต้น)</label>
                <select 
                  className="form-input"
                  value={teacherFormData.gender}
                  onChange={(e) => setTeacherFormData({...teacherFormData, gender: e.target.value})}
                >
                  <option value="female">หญิง</option>
                  <option value="male">ชาย</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">หน้าที่รับผิดชอบ (ป้ายแสดง)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="เช่น ครูประจำชั้นประถมศึกษาปีที่ 5 - 6"
                  value={teacherFormData.duty}
                  onChange={(e) => setTeacherFormData({...teacherFormData, duty: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">วุฒิการศึกษา</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="เช่น ครุศาสตรบัณฑิต (ค.บ.) สาขาภาษาไทย"
                  value={teacherFormData.qualification}
                  onChange={(e) => setTeacherFormData({...teacherFormData, qualification: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">กลุ่มสาระการเรียนรู้ที่รับผิดชอบหลัก</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="เช่น กลุ่มสาระการเรียนรู้ภาษาไทย และวิชาคณิตศาสตร์"
                value={teacherFormData.subject}
                onChange={(e) => setTeacherFormData({...teacherFormData, subject: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">อีเมลติดต่อ (ใช้ระบบ OBEC Mail หรืออีเมลส่วนตัว)</label>
              <input 
                type="email" 
                className="form-input" 
                required 
                placeholder="teacher.name@g.obec.go.th"
                value={teacherFormData.email}
                onChange={(e) => setTeacherFormData({...teacherFormData, email: e.target.value})}
              />
            </div>

            <ImageUploadWidget 
              label="อัปโหลดรูปภาพคุณครูโดยตรง"
              value={teacherFormData.imageUrl}
              onChange={(val) => setTeacherFormData({...teacherFormData, imageUrl: val})}
            />

            <div className="modal-actions-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setIsStaffModalOpen(false)}
              >
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> บันทึกข้อมูลบุคลากร
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete news confirm dialog */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="ยืนยันการลบข่าวประกาศ"
          size="sm"
        >
          <div className="delete-confirm-box text-center">
            <AlertTriangle size={48} className="text-danger mb-3" style={{ margin: '0 auto' }} />
            <h4>คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?</h4>
            <p className="text-muted my-2">การลบข้อมูลจะลบออกจากระบบของโรงเรียนถาวรและไม่สามารถเรียกคืนได้ในภายหลัง</p>
            <div className="delete-actions-footer mt-4">
              <button className="btn btn-outline" onClick={() => setDeleteConfirmId(null)}>ยกเลิก</button>
              <button className="btn btn-danger" onClick={() => handleDeleteNews(deleteConfirmId)}>ยืนยันการลบ</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete teacher confirm dialog */}
      {teacherDeleteConfirmId && (
        <Modal
          isOpen={!!teacherDeleteConfirmId}
          onClose={() => setTeacherDeleteConfirmId(null)}
          title="ยืนยันการลบบุคลากร"
          size="sm"
        >
          <div className="delete-confirm-box text-center">
            <AlertTriangle size={48} className="text-danger mb-3" style={{ margin: '0 auto' }} />
            <h4>ลบข้อมูลคุณครูออกสถานศึกษา?</h4>
            <p className="text-muted my-2">คุณแน่ใจหรือไม่ที่จะลบรายชื่อคุณครูท่านนี้จากทำเนียบ? ข้อมูลนี้จะหายไปจากหน้าเว็บหลักทันที</p>
            <div className="delete-actions-footer mt-4">
              <button className="btn btn-outline" onClick={() => setTeacherDeleteConfirmId(null)}>ยกเลิก</button>
              <button className="btn btn-danger" onClick={() => handleDeleteTeacher(teacherDeleteConfirmId)}>ยืนยันการลบ</button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .admin-dashboard-container {
          min-height: 80vh;
          background-color: #f1f5f9;
        }

        .admin-grid-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: 80vh;
        }

        @media (max-width: 992px) {
          .admin-grid-layout {
            grid-template-columns: 1fr;
          }
          .admin-sidebar {
            border-right: none !important;
            border-bottom: 1px solid var(--color-border);
          }
        }

        /* Sidebar styling */
        .admin-sidebar {
          background-color: #1e293b; /* Deep slate gray for formal dashboard side */
          color: #cbd5e1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #334155;
        }

        .admin-profile-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 20px;
          border-bottom: 1px solid #334155;
          margin-bottom: 24px;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--color-secondary);
          color: #1e293b;
          font-weight: 700;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-username {
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
        }

        .admin-role {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 2px 0 0;
        }

        .admin-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-tab-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 500;
          text-align: left;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: var(--transition-fast);
        }

        .sidebar-tab-btn:hover {
          background-color: #334155;
          color: white;
        }

        .sidebar-tab-btn.active {
          background-color: var(--color-primary);
          color: white;
          border-left: 4px solid var(--color-secondary);
        }

        .badge-count-floating {
          background-color: var(--color-danger);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          margin-left: auto;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid #334155;
        }

        .btn-logout-sidebar {
          width: 100%;
          background: none;
          border: 1px solid #475569;
          color: #94a3b8;
          padding: 10px;
          border-radius: var(--radius-md);
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: var(--transition-fast);
        }

        .btn-logout-sidebar:hover {
          border-color: var(--color-danger);
          color: white;
          background-color: rgba(239, 68, 68, 0.1);
        }

        /* Main Content container */
        .admin-main-content {
          padding: 30px;
          overflow-y: auto;
        }

        @media (max-width: 600px) {
          .admin-main-content {
            padding: 16px;
          }
        }

        .admin-content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .admin-panel-title {
          font-size: 1.5rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .admin-panel-desc {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .admin-toast-alert {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 100000; /* Ensure visibility over all modals and panels */
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 22px;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 600;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15);
          animation: slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideInToast {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .alert-success { background-color: #ecfdf5; border: 1px solid #10b981; color: #065f46; }
        .alert-warning { background-color: #fffbeb; border: 1px solid #f59e0b; color: #78350f; }
        .alert-danger { background-color: #fef2f2; border: 1px solid #ef4444; color: #7f1d1d; }

        /* Card panels */
        .card-layout {
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }

        .card-inner-title {
          font-size: 1.15rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Stats summary */
        .stats-summary-grid {
          margin-bottom: 24px;
        }

        .summary-stat-card {
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sm);
        }

        .summary-stat-card .icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-primary-light { background-color: var(--color-primary-light); }
        .bg-secondary-light { background-color: var(--color-secondary-light); }
        .bg-danger-light { background-color: rgba(239, 68, 68, 0.08); }
        .text-primary { color: var(--color-primary); }
        .text-warning { color: var(--color-secondary); }
        .text-danger { color: var(--color-danger); }

        .summary-stat-card .info .label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .summary-stat-card .info .number {
          font-size: 1.2rem;
          color: var(--color-text-heading);
          font-weight: 700;
          margin-top: 2px;
        }

        /* Table */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        .admin-table th {
          background-color: var(--color-bg-body);
          padding: 12px 16px;
          font-weight: 600;
          color: var(--color-text-heading);
          border-bottom: 2px solid var(--color-border);
          font-family: var(--font-heading);
        }

        .admin-table td {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-main);
          vertical-align: middle;
        }

        .admin-table tr:hover td {
          background-color: #f8fafc;
        }

        .table-thumb {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          border: 1px solid var(--color-border);
        }

        .table-thumb-placeholder {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-sm);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
        }

        .table-news-title {
          font-weight: 600;
          color: var(--color-text-heading);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .table-news-sub {
          display: block;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 2px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .table-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          border: none;
          background: none;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: var(--transition-fast);
        }

        .btn-edit {
          background-color: var(--color-primary-light);
          color: var(--color-primary);
        }

        .btn-edit:hover {
          background-color: var(--color-primary);
          color: white;
        }

        .btn-delete {
          background-color: rgba(239, 68, 68, 0.08);
          color: var(--color-danger);
        }

        .btn-delete:hover {
          background-color: var(--color-danger);
          color: white;
        }

        /* Sorting arrows & other features */
        .sorting-arrows {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
        }

        .arrow-btn {
          background: #f8fafc;
          border: 1px solid var(--color-border);
          color: var(--color-primary);
          padding: 3px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arrow-btn:hover:not(:disabled) {
          background-color: var(--color-primary-light);
          border-color: var(--color-primary);
        }

        .arrow-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .badge-status {
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-published {
          background-color: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .status-draft {
          background-color: #f1f5f9;
          color: #64748b;
          border: 1px solid #cbd5e1;
        }

        .flex-options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #fafbfc;
          padding: 12px 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .form-group-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .form-group-checkbox label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-heading);
          cursor: pointer;
        }

        .form-group-select-inline {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .select-inline {
          padding: 6px 12px !important;
          width: auto !important;
        }

        .bg-light-panel {
          background-color: #faf9f6;
          padding: 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          margin-bottom: 12px;
        }

        /* Modal Tabs */
        .modal-tabs-header {
          display: flex;
          border-bottom: 2px solid var(--color-border);
          margin-bottom: 20px;
          gap: 8px;
        }

        .modal-tab-nav {
          background: none;
          border: none;
          padding: 10px 16px;
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-muted);
          cursor: pointer;
          position: relative;
          top: 2px;
          transition: var(--transition-fast);
        }

        .modal-tab-nav.active {
          color: var(--color-primary);
          border-bottom: 3px solid var(--color-primary);
        }

        /* News Live Preview Pane */
        .news-live-preview-pane {
          background-color: white;
          padding: 24px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          max-height: 500px;
          overflow-y: auto;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .preview-title {
          font-size: 1.6rem;
          color: var(--color-primary);
          font-weight: 700;
          margin-top: 10px;
          line-height: 1.3;
        }

        .preview-subtitle {
          font-size: 1.05rem;
          color: var(--color-text-main);
          margin-bottom: 12px;
        }

        .preview-meta {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 12px;
          margin-bottom: 20px;
        }

        .preview-cover {
          width: 100%;
          max-height: 280px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 20px;
          border: 1px solid var(--color-border);
        }

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-fallback {
          width: 100%;
          height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          padding: 20px;
          text-align: center;
        }

        .preview-body {
          font-size: 0.98rem;
          line-height: 1.7;
          color: var(--color-text-main);
        }

        .preview-attachment-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: var(--color-primary-light);
          border: 1px solid var(--color-primary-medium);
          padding: 12px 18px;
          border-radius: var(--radius-md);
          margin-top: 24px;
        }

        .preview-attachment-box h5 {
          margin: 0;
          font-size: 0.85rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .preview-attachment-box p {
          margin: 2px 0 0 0;
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--color-text-main);
        }

        .preview-gallery {
          margin-top: 30px;
          border-top: 1px solid var(--color-border);
          padding-top: 20px;
        }

        .preview-gallery h5 {
          font-size: 0.9rem;
          color: var(--color-primary);
          margin-bottom: 12px;
        }

        .preview-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }

        .gallery-thumb-wrapper {
          height: 75px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--color-border);
        }

        .gallery-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Quick Guide Card */
        .quick-guide-card {
          border-left: 4px solid var(--color-secondary);
        }

        .quick-guide-card h4 {
          color: var(--color-primary);
          margin-bottom: 8px;
        }

        .quick-guide-card p {
          font-size: 0.9rem;
          margin-bottom: 12px;
        }

        .quick-guide-card ul {
          padding-left: 20px;
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Settings fields */
        .form-sections-divider {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-secondary);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 6px;
          margin: 24px 0 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-sections-divider:first-of-type {
          margin-top: 10px;
        }

        .color-settings-grid {
          margin-top: 10px;
        }

        .color-picker-control {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .color-box-picker {
          width: 50px;
          height: 44px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          padding: 0;
          background: none;
        }

        .code-font {
          font-family: monospace;
          font-size: 0.95rem;
        }

        .form-actions-footer {
          margin-top: 30px;
          border-top: 1px solid var(--color-border);
          padding-top: 20px;
          text-align: right;
        }

        /* Messages stack */
        .messages-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message-item-card {
          background-color: var(--color-bg-body);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px;
          transition: var(--transition-fast);
        }

        .message-item-card:hover {
          border-color: var(--color-primary-medium);
          background-color: white;
          box-shadow: var(--shadow-sm);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 8px;
          border-bottom: 1px dashed var(--color-border);
          padding-bottom: 12px;
          margin-bottom: 12px;
        }

        .sender-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-icon {
          width: 36px;
          height: 36px;
          background-color: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sender-profile h5 {
          font-size: 0.95rem;
          color: var(--color-text-heading);
          font-weight: 600;
          margin: 0;
        }

        .sender-profile .meta {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .msg-date {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .message-content .subject-tag {
          font-size: 0.85rem;
          margin-bottom: 6px;
        }

        .message-content .body {
          font-size: 0.9rem;
          color: var(--color-text-main);
          white-space: pre-wrap;
          line-height: 1.5;
        }

        /* Modal specific form action */
        .modal-actions-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          border-top: 1px solid var(--color-border);
          padding-top: 18px;
        }

        .delete-confirm-box {
          padding: 10px;
        }

        .delete-actions-footer {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .mb-4 { margin-bottom: 1rem; }
        .my-2 { margin: 0.5rem 0; }
        .py-4 { padding: 1.5rem 0; }
        .py-5 { padding: 3rem 0; }

        /* Image Upload Widget Styling */
        .image-upload-widget {
          margin-bottom: 16px;
        }

        .upload-container {
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-md);
          background-color: #fafbfc;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .upload-container:hover {
          border-color: var(--color-primary);
        }

        .upload-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          width: 100%;
          text-align: center;
          padding: 12px 0;
        }

        .upload-text {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .hidden-file-input {
          display: none;
        }

        .upload-preview-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .upload-preview {
          max-width: 100%;
          max-height: 180px;
          border-radius: var(--radius-md);
          object-fit: contain;
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
        }

        .btn-remove-image {
          background-color: rgba(239, 68, 68, 0.08);
          color: var(--color-danger);
          border: 1px solid rgba(239, 68, 68, 0.15);
          padding: 6px 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: var(--transition-fast);
        }

        .btn-remove-image:hover {
          background-color: var(--color-danger);
          color: white;
        }

        /* Multiple image upload */
        .multiple-upload-container {
          background-color: #fafbfc;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .gallery-previews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
          gap: 12px;
        }

        .gallery-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
        }

        .gallery-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-remove-gallery-img {
          position: absolute;
          top: 4px;
          right: 4px;
          background-color: rgba(239, 68, 68, 0.85);
          color: white;
          border: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 11px;
          transition: var(--transition-fast);
        }

        .btn-remove-gallery-img:hover {
          background-color: var(--color-danger);
          transform: scale(1.1);
        }

        .upload-dropzone-square {
          aspect-ratio: 1;
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text-muted);
          transition: var(--transition-fast);
        }

        .upload-dropzone-square:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background-color: var(--color-primary-light);
        }

        /* Analytics Dashboard styling */
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 992px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
        .analytics-card {
          padding: 24px;
          border-top: 4px solid var(--color-primary);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .analytics-subtitle {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .analytics-bar-row {
          margin-bottom: 12px;
        }
        .analytics-bar-label {
          font-size: 0.82rem;
          color: var(--color-text-main);
          margin-bottom: 4px;
          max-width: 100%;
        }
        .analytics-bar-progress-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .analytics-bar-fill-bg {
          flex-grow: 1;
          height: 10px;
          background-color: var(--color-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .analytics-bar-fill {
          height: 100%;
          background-color: var(--color-primary);
          border-radius: var(--radius-full);
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .analytics-bar-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-primary);
          white-space: nowrap;
        }
        .pct-item {
          margin-bottom: 10px;
        }
        .pct-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          margin-bottom: 4px;
        }
        .pct-label {
          color: var(--color-text-main);
          font-weight: 500;
        }
        .pct-val {
          font-weight: 600;
        }
        .pct-bar-bg {
          height: 8px;
          background-color: var(--color-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .pct-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pct-bar-fill.bg-announcement {
          background-color: #f43f5e;
        }
        .pct-bar-fill.bg-pr {
          background-color: #3b82f6;
        }
        .pct-bar-fill.bg-activity {
          background-color: #10b981;
        }
        .pct-bar-fill.bg-secondary-color {
          background-color: var(--color-secondary);
        }
        .storage-meter-box {
          background-color: #faf9f6;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .meter-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 6px;
        }
        .system-props-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.82rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 16px;
        }
        .prop-row {
          display: flex;
          justify-content: space-between;
        }
        .prop-lbl {
          color: var(--color-text-muted);
        }
        .prop-val {
          color: var(--color-primary);
        }
        .audit-logs-container {
          background-color: #0f172a;
          color: #e2e8f0;
          font-family: 'Consolas', 'Courier New', Courier, monospace;
          font-size: 0.72rem;
          padding: 12px;
          border-radius: var(--radius-md);
          max-height: 140px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .audit-log-entry {
          display: flex;
          gap: 8px;
          line-height: 1.4;
        }
        .log-time {
          color: #64748b;
          flex-shrink: 0;
        }
        .log-cat {
          font-weight: bold;
          flex-shrink: 0;
          padding: 0 4px;
          border-radius: 2px;
          font-size: 0.65rem;
        }
        .log-cat-sec {
          background-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.3);
        }
        .log-cat-sys {
          background-color: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid rgba(59,130,246,0.3);
        }
        .log-cat-theme {
          background-color: rgba(234, 179, 8, 0.2);
          color: #eab308;
          border: 1px solid rgba(234,179,8,0.3);
        }
        .log-cat-file {
          background-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.3);
        }
        .log-cat-auth {
          background-color: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.3);
        }
        .log-text {
          color: #cbd5e1;
        }

        /* Env note and cloud-sync settings styling */
        .env-badge-note {
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 20px;
          font-family: var(--font-heading);
        }
        .cloud-sync-card {
          border-top: 5px solid var(--color-secondary) !important;
        }
        .status-indicator {
          font-size: 0.82rem;
          font-weight: 500;
        }
        .animate-spin {
          animation: spin-anim 1s linear infinite;
        }
        @keyframes spin-anim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
