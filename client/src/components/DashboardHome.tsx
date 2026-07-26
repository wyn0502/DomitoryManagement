import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import {
  FileText, Search, BellFill, PeopleFill, CalendarEvent, CaretRightFill,
  DoorOpenFill, CashCoin, PersonVcardFill, HouseDoorFill,
} from 'react-bootstrap-icons';

interface User {
  id: number;
  full_name: string;
  room_id: number | null;
  room_name: string | null;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface Member {
  id: number;
  full_name: string;
  mssv: string;
  role: string;
}

interface DashboardHomeProps {
  token: string;
  user: User;
  setActiveTab: (tab: string) => void;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const DashboardHome: React.FC<DashboardHomeProps> = ({ token, user, setActiveTab }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterQuery, setFilterQuery] = useState({ text: '', start: '', end: '' });

  // Tải bảng tin (thật, từ DB)
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API}/api/announcements`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Không thể tải bản tin thông báo');
        setAnnouncements(await res.json());
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [token]);

  // Tải danh sách bạn cùng phòng (thật, từ DB)
  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const res = await fetch(`${API}/api/rooms/my-members`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setMembers(Array.isArray(data) ? data : []);
        }
      } catch {
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };
    fetchMembers();
  }, [token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterQuery({ text: searchTerm, start: startDate, end: endDate });
  };

  const getDepartment = (title: string, content: string): string => {
    const text = (title + ' ' + content).toLowerCase();
    if (text.includes('tiền') || text.includes('phí') || text.includes('hóa đơn') || text.includes('thanh toán')) return 'Phòng Tài chính';
    if (text.includes('bảo trì') || text.includes('sửa chữa') || text.includes('điều hòa') || text.includes('thiết bị')) return 'Ban Cơ sở vật chất';
    return 'Phòng Quản lý KTX';
  };

  const getDeptColor = (dept: string): string => {
    switch (dept) {
      case 'Phòng Tài chính': return 'text-danger';
      case 'Ban Cơ sở vật chất': return 'text-warning';
      default: return 'text-success';
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const dept = getDepartment(item.title, item.content);
    if (activeCategory !== 'all') {
      if (activeCategory === 'management' && dept !== 'Phòng Quản lý KTX') return false;
      if (activeCategory === 'facilities' && dept !== 'Ban Cơ sở vật chất') return false;
      if (activeCategory === 'finance' && dept !== 'Phòng Tài chính') return false;
    }
    if (filterQuery.text) {
      const matchText = (item.title + ' ' + item.content).toLowerCase();
      if (!matchText.includes(filterQuery.text.toLowerCase())) return false;
    }
    const createdDate = new Date(item.created_at);
    if (filterQuery.start && createdDate < new Date(filterQuery.start)) return false;
    if (filterQuery.end) {
      const end = new Date(filterQuery.end);
      end.setHours(23, 59, 59, 999);
      if (createdDate > end) return false;
    }
    return true;
  });

  const quickCards = [
    { icon: <DoorOpenFill size={28} />, wrap: 'text-primary', bg: 'rgba(30,58,138,0.1)', label: 'Đăng ký phòng ở', action: () => setActiveTab('register-room') },
    { icon: <CashCoin size={28} />, wrap: 'text-danger', bg: 'rgba(239,68,68,0.1)', label: 'Hóa đơn & Thanh toán', action: () => setActiveTab('billing') },
    { icon: <PersonVcardFill size={28} />, wrap: 'text-success', bg: 'rgba(16,185,129,0.1)', label: 'Thông tin cá nhân', action: () => setActiveTab('profile') },
  ];

  const avatarColors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-info'];

  return (
    <div className="dashboard-home-wrapper animate-fade-in">
      {/* Chào mừng */}
      <div className="mb-4 p-3 rounded-4" style={{ backgroundColor: 'rgba(30,58,138,0.06)', border: '1px solid rgba(30,58,138,0.15)' }}>
        <h4 className="fw-bold mb-1" style={{ color: 'var(--primary)' }}>Xin chào!</h4>
        <p className="text-secondary mb-0">Chào mừng sinh viên <strong className="text-dark">{user.full_name}</strong> đã đăng nhập vào hệ thống ký túc xá.</p>
      </div>

      {/* Lối tắt nhanh tới các chức năng THẬT */}
      <Row className="g-3 mb-4">
        {quickCards.map((c, i) => (
          <Col key={i} xs={12} sm={4}>
            <Card className="border-0 shadow-sm rounded-4 p-3 quick-card h-100" onClick={c.action}>
              <div className="d-flex align-items-center gap-3">
                <div className={`quick-icon-wrap ${c.wrap}`} style={{ backgroundColor: c.bg, width: '52px', height: '52px' }}>
                  {c.icon}
                </div>
                <div className="quick-label fw-semibold" style={{ color: 'var(--text-primary)' }}>{c.label}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Bảng tin (THẬT - từ DB) */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-glass)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
                <BellFill className="me-2 text-warning" /> Bảng tin Ký túc xá
              </h5>
              <Button variant="link" className="text-decoration-none p-0 small" style={{ color: 'var(--primary)' }} onClick={() => setFilterQuery({ text: '', start: '', end: '' })}>Xem tất cả</Button>
            </div>

            <Form onSubmit={handleSearchSubmit} className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-glass)' }}>
              <Row className="g-2">
                <Col md={5}><Form.Control type="text" placeholder="Tìm kiếm tiêu đề, nội dung..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} /></Col>
                <Col md={3}><Form.Control type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} /></Col>
                <Col md={3}><Form.Control type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} /></Col>
                <Col md={1} className="d-grid">
                  <Button type="submit" variant="primary" className="p-0 d-flex justify-content-center align-items-center"><Search size={16} /></Button>
                </Col>
              </Row>
            </Form>

            <Tabs activeKey={activeCategory} onSelect={(k: any) => setActiveCategory(k || 'all')} className="mb-3 custom-tabs">
              <Tab eventKey="all" title="Toàn bộ" />
              <Tab eventKey="management" title="Phòng Quản lý KTX" />
              <Tab eventKey="facilities" title="Ban Cơ sở vật chất" />
              <Tab eventKey="finance" title="Phòng Tài chính" />
            </Tabs>

            {loading ? (
              <div className="text-center py-4"><Spinner animation="border" variant="warning" /></div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center text-secondary py-5">Không tìm thấy thông báo nào phù hợp.</div>
            ) : (
              <div className="announcements-list overflow-y-auto" style={{ maxHeight: '380px' }}>
                {filteredAnnouncements.map((item) => {
                  const dept = getDepartment(item.title, item.content);
                  const colorClass = getDeptColor(dept);
                  return (
                    <Card key={item.id} className="border-0 mb-3 p-3 announcement-card rounded-3" style={{ backgroundColor: '#f8fafc' }}>
                      <Row className="g-3 align-items-center">
                        <Col xs={2} sm={1.5} className="text-center">
                          <div className="announcement-icon bg-warning bg-opacity-10 p-2 rounded-circle text-warning d-inline-block"><FileText size={24} /></div>
                        </Col>
                        <Col xs={10} sm={10.5}>
                          <h6 className="fw-bold mb-1 text-truncate-2" style={{ fontSize: '0.925rem', color: 'var(--text-primary)' }}>{item.title}</h6>
                          <div className="d-flex flex-wrap gap-3 align-items-center text-secondary" style={{ fontSize: '0.8rem' }}>
                            <span className={`fw-semibold d-flex align-items-center gap-1 ${colorClass}`}><CaretRightFill size={10} /> {dept}</span>
                            <span className="d-flex align-items-center gap-1"><CalendarEvent size={12} /> {new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                            <span className="text-decoration-underline cursor-pointer fw-semibold ms-auto" style={{ color: 'var(--primary)' }} onClick={() => alert(`NỘI DUNG THÔNG BÁO:\n\n${item.content}`)}>Xem chi tiết</span>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Thành viên trong phòng (THẬT - từ DB) */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-glass)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <PeopleFill className="text-primary" /> Thành viên trong phòng
              </h5>
              {user.room_name && <span className="badge bg-primary bg-opacity-10 text-primary">{user.room_name}</span>}
            </div>

            {membersLoading ? (
              <div className="text-center py-4"><Spinner animation="border" variant="primary" size="sm" /></div>
            ) : !user.room_id ? (
              <div className="text-center text-secondary py-4">
                <HouseDoorFill size={32} className="mb-2 d-block mx-auto text-muted" />
                Bạn chưa đăng ký phòng ở.
                <div className="mt-2">
                  <Button size="sm" variant="primary" onClick={() => setActiveTab('register-room')}>Đăng ký phòng ngay</Button>
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center text-secondary py-4">Phòng chưa có thành viên nào khác.</div>
            ) : (
              <div className="friend-list d-flex flex-column gap-2">
                {members.map((m, i) => {
                  const isMe = m.id === user.id;
                  return (
                    <div key={m.id} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ backgroundColor: isMe ? 'rgba(30,58,138,0.06)' : '#f8fafc', border: isMe ? '1px solid rgba(30,58,138,0.2)' : '1px solid transparent' }}>
                      <div className={`avatar-placeholder ${avatarColors[i % avatarColors.length]} text-white rounded-circle fw-bold d-flex justify-content-center align-items-center`} style={{ width: '40px', height: '40px' }}>
                        {(m.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {m.full_name || '(Chưa cập nhật)'} {isMe && <span className="badge bg-primary ms-1" style={{ fontSize: '0.6rem' }}>Bạn</span>}
                        </h6>
                        <span className="text-secondary small">Sinh viên{m.mssv ? ` | MSSV: ${m.mssv}` : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
