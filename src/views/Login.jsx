import React, { useState } from 'react';
import { authService } from '../services/auth';
import { Shield, KeyRound, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login({ setView, setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Artificial tiny delay for premium feel loading spinner
    setTimeout(() => {
      const result = authService.login(username, password);
      setLoading(false);
      
      if (result.success) {
        setUser(result.user);
        setView('admin');
      } else {
        setError(result.message);
      }
    }, 600);
  };

  return (
    <div className="login-view-wrapper flex-center section-padding animate-fade-in">
      <div className="login-card">
        {/* Top Header Card */}
        <div className="login-card-header text-center">
          <div className="shield-icon-wrapper">
            <Shield size={36} />
          </div>
          <h3>ระบบจัดการหลังบ้าน (CMS)</h3>
          <p className="text-muted">เข้าสู่ระบบสำหรับเจ้าหน้าที่และผู้ดูแลระบบโรงเรียน</p>
          <div className="school-divider">
            <span className="school-divider-dot"></span>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="error-alert animate-fade-in">
            <AlertCircle size={18} className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">ชื่อผู้ใช้งาน (Username)</label>
            <div className="input-with-icon-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                id="username" 
                className="form-input with-icon" 
                placeholder="กรอกชื่อผู้ใช้งาน" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">รหัสผ่าน (Password)</label>
            <div className="input-with-icon-wrapper">
              <KeyRound size={18} className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                className="form-input with-icon" 
                placeholder="กรอกรหัสผ่าน" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

      </div>

      <style>{`
        .login-view-wrapper {
          min-height: 70vh;
          background-color: var(--color-bg-body);
        }

        .login-card {
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          padding: 40px;
          width: 100%;
          max-width: 450px;
          box-shadow: var(--shadow-lg);
          border-top: 5px solid var(--color-primary);
        }

        .shield-icon-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: var(--color-primary-light);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          border: 2px solid var(--color-secondary);
        }

        .login-card-header h3 {
          font-size: 1.35rem;
          color: var(--color-primary);
          margin-bottom: 6px;
        }

        .login-card-header p {
          font-size: 0.85rem;
        }

        .input-with-icon-wrapper {
          position: relative;
          width: 100%;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .form-input.with-icon {
          padding-left: 44px;
        }

        .password-toggle-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .password-toggle-btn:hover {
          color: var(--color-text-heading);
          background-color: var(--color-bg-body);
        }

        .error-alert {
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--color-danger);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .error-icon {
          flex-shrink: 0;
        }

        .w-100 { width: 100%; }
        .mt-2 { margin-top: 0.5rem; }
      `}</style>
    </div>
  );
}
