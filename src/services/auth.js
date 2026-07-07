// Authentication service for school admin panel using LocalStorage
// Simulates login, logout, and session checks

const STORAGE_KEYS = {
  ADMIN_SESSION: 'wanghuawaen_admin_session'
};

// Hardcoded admin credential for this stage
// Username: admin
// Password: password123
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password123',
  name: 'ผู้ดูแลระบบ (Admin)',
  role: 'Administrator'
};

export const authService = {
  login(username, password) {
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const session = {
        isLoggedIn: true,
        username: ADMIN_CREDENTIALS.username,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
      return { success: true, user: session };
    }
    return { success: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    return true;
  },

  getCurrentUser() {
    try {
      const sessionStr = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        // Simple session expiration check (e.g., 2 hours)
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const diffMs = now - loginTime;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        if (diffHours < 2) {
          return session;
        } else {
          // Session expired
          this.logout();
        }
      }
    } catch (e) {
      console.error("Error reading admin session:", e);
    }
    return null;
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }
};
