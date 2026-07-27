import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentBilling from './components/StudentBilling';
import DashboardHome from './components/DashboardHome';
import Profile from './components/Profile';
import RoomRegistration from './components/RoomRegistration';
import StudentsAdmin from './components/StudentsAdmin';
import {
  HouseDoorFill, PersonVcardFill, CreditCard2FrontFill, BoxArrowRight,
  Grid1x2Fill, ReceiptCutoff, DoorOpenFill, ArrowRepeat, PeopleFill,
} from 'react-bootstrap-icons';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  room_id: number | null;
  room_name: string | null;
  room_status?: string;
  full_name: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const ADMIN_MENU: MenuItem[] = [
  { key: 'overview', label: 'Tổng quan', icon: <Grid1x2Fill size={18} /> },
  { key: 'students', label: 'Sinh viên', icon: <PeopleFill size={18} /> },
  { key: 'invoices', label: 'Quản lý hóa đơn', icon: <ReceiptCutoff size={18} /> },
  { key: 'rooms', label: 'Phòng ở', icon: <DoorOpenFill size={18} /> },
];

const STUDENT_MENU: MenuItem[] = [
  { key: 'home', label: 'Trang chủ / Tin tức', icon: <HouseDoorFill size={18} /> },
  { key: 'profile', label: 'Thông tin cá nhân', icon: <PersonVcardFill size={18} /> },
  { key: 'register-room', label: 'Đăng ký phòng ở', icon: <DoorOpenFill size={18} /> },
  { key: 'billing', label: 'Hóa đơn & Thanh toán', icon: <CreditCard2FrontFill size={18} /> },
];

const PAGE_TITLES: Record<string, string> = {
  overview: 'Tổng quan hệ thống',
  students: 'Quản lý Sinh viên & Duyệt phòng',
  invoices: 'Quản lý Hóa đơn & Chỉ số điện nước',
  rooms: 'Danh sách Phòng ở',
  home: 'Trang chủ / Tin tức',
  profile: 'Thông tin cá nhân',
  'register-room': 'Đăng ký phòng ở Ký túc xá',
  billing: 'Hóa đơn & Thanh toán',
};

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('home');

  useEffect(() => {
    const savedToken = localStorage.getItem('dorm_token');
    const savedUser = localStorage.getItem('dorm_user');
    if (savedToken && savedUser) {
      const parsed: User = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsed);
      setActiveTab(parsed.role === 'admin' ? 'overview' : 'home');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userToken: string, userData: User) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('dorm_token', userToken);
    localStorage.setItem('dorm_user', JSON.stringify(userData));
    setActiveTab(userData.role === 'admin' ? 'overview' : 'home');
  };

  // Sau khi sinh viên gửi yêu cầu đăng ký phòng -> chuyển trạng thái sang "chờ duyệt"
  const handleRoomRequested = () => {
    if (!user) return;
    const updated = { ...user, room_status: 'pending' };
    setUser(updated);
    localStorage.setItem('dorm_user', JSON.stringify(updated));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('dorm_token');
    localStorage.removeItem('dorm_user');
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <h2 className="d-flex align-items-center gap-2"><ArrowRepeat size={28} /> Đang tải hệ thống...</h2>
      </div>
    );
  }

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = user.role === 'admin';
  const menu = isAdmin ? ADMIN_MENU : STUDENT_MENU;
  const initial = (user.full_name || user.username || '?').charAt(0).toUpperCase();

  return (
    <div className="pk-shell">
      {/* ===== SIDEBAR (kiểu Phenikaa) ===== */}
      <aside className="pk-sidebar">
        <div className="pk-logo">
          <div className="pk-logo-ring" />
          <div className="pk-logo-text">
            <b>DOMITORY</b>
            <span>KÝ TÚC XÁ</span>
          </div>
        </div>

        <nav className="pk-side-nav">
          {menu.map((item) => (
            <button
              key={item.key}
              className={`pk-side-link ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <button className="pk-side-link pk-side-logout mt-auto" onClick={handleLogout}>
            <BoxArrowRight size={18} />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="pk-main">
        <header className="pk-topbar">
          <h1 className="pk-page-title">{PAGE_TITLES[activeTab] || 'Hệ thống Ký túc xá'}</h1>
          <div className="pk-user-badge">
            <div className="pk-user-avatar">{initial}</div>
            <div style={{ lineHeight: 1.1 }}>
              <span className="d-block small fw-bold" style={{ color: 'var(--text-primary)' }}>{user.full_name || user.username}</span>
              <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                {isAdmin ? 'Quản trị viên' : 'Sinh viên nội trú'}
              </span>
            </div>
          </div>
        </header>

        <main className="pk-content">
          {isAdmin ? (
            activeTab === 'students'
              ? <StudentsAdmin token={token} />
              : <AdminDashboard token={token} section={activeTab} />
          ) : (
            <>
              {activeTab === 'home' && (
                <DashboardHome token={token} user={user} setActiveTab={setActiveTab} />
              )}
              {activeTab === 'profile' && <Profile token={token} />}
              {activeTab === 'register-room' && (
                <RoomRegistration token={token} user={user} onRoomRequested={handleRoomRequested} />
              )}
              {activeTab === 'billing' && <StudentBilling token={token} user={user} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
