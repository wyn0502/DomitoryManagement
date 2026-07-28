import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import {
  BellFill, Search, CalendarEvent, CaretRightFill, Building, FileText, FunnelFill,
} from 'react-bootstrap-icons';

interface AnnouncementsListProps {
  token: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({ token }) => {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API}/api/announcements`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Không thể tải bảng tin thông báo');
        setAnnouncements(await res.json());
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [token]);

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

  const getDeptBadgeBg = (dept: string): string => {
    switch (dept) {
      case 'Phòng Tài chính': return 'rgba(239,68,68,0.1)';
      case 'Ban Cơ sở vật chất': return 'rgba(245,158,11,0.12)';
      default: return 'rgba(16,185,129,0.1)';
    }
  };

  const truncate = (text: string, max: number): string =>
    text.length > max ? text.slice(0, max).trim() + '…' : text;

  const filteredAnnouncements = announcements.filter((item) => {
    const dept = getDepartment(item.title, item.content);
    if (activeCategory !== 'all') {
      if (activeCategory === 'management' && dept !== 'Phòng Quản lý KTX') return false;
      if (activeCategory === 'facilities' && dept !== 'Ban Cơ sở vật chất') return false;
      if (activeCategory === 'finance' && dept !== 'Phòng Tài chính') return false;
    }
    if (searchTerm) {
      const matchText = (item.title + ' ' + item.content).toLowerCase();
      if (!matchText.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const categories = [
    { key: 'all', label: 'Tất cả', count: announcements.length },
    { key: 'management', label: 'Phòng Quản lý KTX', count: announcements.filter((a) => getDepartment(a.title, a.content) === 'Phòng Quản lý KTX').length },
    { key: 'facilities', label: 'Ban Cơ sở vật chất', count: announcements.filter((a) => getDepartment(a.title, a.content) === 'Ban Cơ sở vật chất').length },
    { key: 'finance', label: 'Phòng Tài chính', count: announcements.filter((a) => getDepartment(a.title, a.content) === 'Phòng Tài chính').length },
  ];

  return (
    <div className="announcements-list-wrapper animate-fade-in">
      <Card
        className="border-0 shadow-sm rounded-4 p-4 p-md-4"
        style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-glass)' }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
            <BellFill className="me-2 text-warning" /> Bảng tin thông báo Ký túc xá
          </h5>
          <span className="text-secondary small d-flex align-items-center gap-2">
            <FunnelFill size={12} />
            Tổng: <strong style={{ color: 'var(--text-primary)' }}>{filteredAnnouncements.length}</strong> / {announcements.length} thông báo
          </span>
        </div>

        <InputGroup className="mb-3" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-glass)' }}>
          <InputGroup.Text style={{ backgroundColor: 'transparent', border: 'none' }}>
            <Search className="text-secondary" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
          />
        </InputGroup>

        <div className="d-flex flex-wrap gap-2 mb-4">
          {categories.map((c) => (
            <Button
              key={c.key}
              size="sm"
              variant={activeCategory === c.key ? 'primary' : 'outline-secondary'}
              className="rounded-pill px-3 d-inline-flex align-items-center gap-2"
              onClick={() => setActiveCategory(c.key)}
              style={activeCategory === c.key ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
            >
              {c.label}
              <span
                className="badge"
                style={{
                  backgroundColor: activeCategory === c.key ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: activeCategory === c.key ? '#fff' : '#475569',
                  fontSize: '0.7rem',
                }}
              >
                {c.count}
              </span>
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="warning" />
            <p className="mt-3 text-secondary mb-0">Đang tải bảng tin...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center text-secondary py-5">
            <BellFill size={36} className="mb-2 d-block mx-auto text-muted" />
            Không tìm thấy thông báo nào phù hợp.
          </div>
        ) : (
          <Row className="g-3">
            {filteredAnnouncements.map((item) => {
              const dept = getDepartment(item.title, item.content);
              const colorClass = getDeptColor(dept);
              const badgeBg = getDeptBadgeBg(dept);
              return (
                <Col key={item.id} xs={12}>
                  <Card
                    className="border-0 p-3 announcement-card rounded-3"
                    style={{
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent',
                    }}
                    onClick={() => navigate(`/announcements-list/${item.id}`)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(30,58,138,0.12)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,58,138,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    }}
                  >
                    <Row className="g-3 align-items-center">
                      <Col xs={2} sm={1} className="text-center">
                        <div
                          className="p-2 rounded-circle d-inline-block"
                          style={{ backgroundColor: badgeBg }}
                        >
                          <FileText size={22} className={colorClass} />
                        </div>
                      </Col>
                      <Col xs={10} sm={11}>
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                          <h6
                            className="fw-bold mb-0"
                            style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.4 }}
                          >
                            {item.title}
                          </h6>
                          <span
                            className={`badge fw-semibold flex-shrink-0 ${colorClass}`}
                            style={{ backgroundColor: badgeBg, fontSize: '0.7rem' }}
                          >
                            <Building className="me-1" size={10} />
                            {dept}
                          </span>
                        </div>
                        <p
                          className="mb-2 text-secondary"
                          style={{ fontSize: '0.875rem', lineHeight: 1.5 }}
                        >
                          {truncate(item.content, 160)}
                        </p>
                        <div className="d-flex flex-wrap gap-3 align-items-center" style={{ fontSize: '0.8rem' }}>
                          <span className="text-secondary d-flex align-items-center gap-1">
                            <CalendarEvent size={12} />
                            {new Date(item.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                          <span
                            className="ms-auto fw-semibold d-inline-flex align-items-center gap-1"
                            style={{ color: 'var(--primary)' }}
                          >
                            Đọc chi tiết <CaretRightFill size={10} />
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>
    </div>
  );
};

export default AnnouncementsList;
