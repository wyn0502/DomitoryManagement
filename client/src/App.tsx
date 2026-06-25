import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentBilling from './components/StudentBilling';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  room_id: number | null;
  room_name: string | null;
  full_name: string;
}

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if session token exists in localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('dorm_token');
    const savedUser = localStorage.getItem('dorm_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userToken: string, userData: User) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('dorm_token', userToken);
    localStorage.setItem('dorm_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('dorm_token');
    localStorage.removeItem('dorm_user');
    // Clear URL query search parameters just in case
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <h2 style={{ color: '#fff' }}>🔄 Đang tải hệ thống...</h2>
      </div>
    );
  }

  // If not authenticated, render Login/Registration form
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="app-container">
      {/* Global Navigation Header */}
      <header className="main-header">
        <div className="nav-container">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); }}>
            <span>🏢</span>
            <span>
              DORM<span className="nav-logo-accent">_KTX</span>
            </span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {user && (
              <div className="user-badge">
                <div className="user-avatar">
                  {isAdmin ? 'A' : 'S'}
                </div>
                <div>
                  <span className="user-name">{user.full_name}</span>
                  <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {isAdmin ? 'Quản trị viên' : `Phòng ${user.room_name || 'chưa xếp'}`}
                  </span>
                </div>
              </div>
            )}

            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout-link">
              Đăng xuất 🚪
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Pane depending on Role */}
      {isAdmin ? (
        <AdminDashboard token={token} />
      ) : (
        user && <StudentBilling token={token} user={user} />
      )}

      {/* Aesthetic Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '2rem', textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© 2026 Ký Túc Xá Đại Học - Hệ Thống Quản Lý & Thanh Tính PayOS (VietQR).</p>
        <p style={{ marginTop: '0.25rem' }}>Thiết kế bởi Quỳnh (SV1) - Bài tập lớn thực hành Web nâng cao.</p>
      </footer>
    </div>
  );
};

export default App;
