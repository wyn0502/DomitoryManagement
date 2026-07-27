import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
  path: string;
  label: string;
  icon: React.ReactNode;
}

const ADMIN_MENU: MenuItem[] = [
  { key: 'overview', path: '/overview', label: 'Tổng quan', icon: <Grid1x2Fill size={18} /> },
  { key: 'students', path: '/students', label: 'Sinh viên', icon: <PeopleFill size={18} /> },
  { key: 'invoices', path: '/invoices', label: 'Quản lý hóa đơn', icon: <ReceiptCutoff size={18} /> },
  { key: 'rooms', path: '/rooms', label: 'Phòng ở', icon: <DoorOpenFill size={18} /> },
];

const STUDENT_MENU: MenuItem[] = [
  { key: 'home', path: '/home', label: 'Trang chủ / Tin tức', icon: <HouseDoorFill size={18} /> },
  { key: 'profile', path: '/profile', label: 'Thông tin cá nhân', icon: <PersonVcardFill size={18} /> },
  { key: 'register-room', path: '/register-room', label: 'Đăng ký phòng ở', icon: <DoorOpenFill size={18} /> },
  { key: 'billing', path: '/billing', label: 'Hóa đơn & Thanh toán', icon: <CreditCard2FrontFill size={18} /> },
];

const PAGE_TITLES: Record<string, string> = {
  '/overview': 'Tổng quan hệ thống',
  '/students': 'Quản lý Sinh viên & Duyệt phòng',
  '/invoices': 'Quản lý Hóa đơn & Chỉ số điện nước',
  '/rooms': 'Danh sách Phòng ở',
  '/home': 'Trang chủ / Tin tức',
  '/profile': 'Thông tin cá nhân',
  '/register-room': 'Đăng ký phòng ở Ký túc xá',
  '/billing': 'Hóa đơn & Thanh toán',
};

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('dorm_token');
      const savedUser = localStorage.getItem('dorm_user');

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          try {
            const parsed: User = JSON.parse(savedUser);
            setUser(parsed);
          } catch (e) {}
        }

        // Tải lại thông tin mới nhất từ DB để đồng bộ khi F5
        try {
          const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';
          const res = await fetch(`${API}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          if (res.ok) {
            const fresh = await res.json();
            const freshUser: User = {
              id: fresh.id,
              username: fresh.username,
              email: fresh.email,
              role: fresh.role,
              room_id: fresh.room_id,
              room_name: fresh.room ? fresh.room.room_name : null,
              room_status: fresh.room_status,
              full_name: fresh.full_name || fresh.username,
            };
            setUser(freshUser);
            localStorage.setItem('dorm_user', JSON.stringify(freshUser));
          }
        } catch (e) {
          console.warn('Lỗi đồng bộ hồ sơ khi khởi chạy:', e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLoginSuccess = (userToken: string, userData: User) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('dorm_token', userToken);
    localStorage.setItem('dorm_user', JSON.stringify(userData));
    navigate(userData.role === 'admin' ? '/overview' : '/home');
  };

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
    navigate('/');
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
  const currentPath = location.pathname;

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
              className={`pk-side-link ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
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

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="pk-main">
        <header className="pk-topbar">
          <h1 className="pk-page-title">{PAGE_TITLES[currentPath] || 'Hệ thống Ký túc xá'}</h1>
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
          <Routes>
            {isAdmin ? (
              <>
                <Route path="/overview" element={<AdminDashboard token={token} section="overview" />} />
                <Route path="/students" element={<StudentsAdmin token={token} />} />
                <Route path="/invoices" element={<AdminDashboard token={token} section="invoices" />} />
                <Route path="/rooms" element={<AdminDashboard token={token} section="rooms" />} />
                <Route path="*" element={<Navigate to="/overview" replace />} />
              </>
            ) : (
              <>
                <Route path="/home" element={<DashboardHome token={token} user={user} setActiveTab={(key) => navigate('/' + key)} />} />
                <Route path="/profile" element={<Profile token={token} />} />
                <Route path="/register-room" element={<RoomRegistration token={token} user={user} onRoomRequested={handleRoomRequested} />} />
                <Route path="/billing" element={<StudentBilling token={token} user={user} />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
