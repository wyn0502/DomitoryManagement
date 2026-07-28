import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import {
  BellFill, ArrowLeft, CalendarEvent, PersonBadge, Building, ClockHistory,
  ExclamationTriangleFill,
} from 'react-bootstrap-icons';

interface AnnouncementDetailProps {
  token: string;
}

interface AnnouncementData {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const AnnouncementDetail: React.FC<AnnouncementDetailProps> = ({ token }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        setError('ID thông báo không hợp lệ');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API}/api/announcements/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 404) throw new Error('Thông báo không tồn tại hoặc đã bị xoá.');
          throw new Error(`Không thể tải thông báo (HTTP ${res.status})`);
        }
        const data = await res.json();
        setAnnouncement(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, token]);

  const getDepartment = (title: string, content: string): string => {
    const text = (title + ' ' + content).toLowerCase();
    if (text.includes('tiền') || text.includes('phí') || text.includes('hóa đơn') || text.includes('thanh toán')) return 'Phòng Tài chính';
    if (text.includes('bảo trì') || text.includes('sửa chữa') || text.includes('điều hòa') || text.includes('thiết bị')) return 'Ban Cơ sở vật chất';
    return 'Phòng Quản lý KTX';
  };

  const getDeptBadge = (dept: string): { bg: string; icon: React.ReactNode } => {
    switch (dept) {
      case 'Phòng Tài chính':
        return { bg: 'danger', icon: <Building className="me-1" /> };
      case 'Ban Cơ sở vật chất':
        return { bg: 'warning', icon: <Building className="me-1" /> };
      default:
        return { bg: 'success', icon: <PersonBadge className="me-1" /> };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-3 text-secondary">Đang tải nội dung thông báo...</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="animate-fade-in">
        <Button variant="link" className="text-decoration-none ps-0 mb-3" style={{ color: 'var(--primary)' }} onClick={() => navigate('/announcements-list')}>
          <ArrowLeft className="me-1" /> Quay lại danh sách
        </Button>
        <Alert variant="danger" className="d-flex align-items-center gap-2">
          <ExclamationTriangleFill size={20} />
          <span>{error || 'Không tìm thấy thông báo.'}</span>
        </Alert>
      </div>
    );
  }

  const dept = getDepartment(announcement.title, announcement.content);
  const deptBadge = getDeptBadge(dept);
  const createdAt = new Date(announcement.created_at);
  const updatedAt = announcement.updated_at ? new Date(announcement.updated_at) : null;

  return (
    <div className="announcement-detail-wrapper animate-fade-in">
      <Button
        variant="link"
        className="text-decoration-none ps-0 mb-3 d-inline-flex align-items-center gap-2"
        style={{ color: 'var(--primary)' }}
        onClick={() => navigate('/announcements-list')}
      >
        <ArrowLeft size={18} /> Quay lại danh sách thông báo
      </Button>

      <Card
        className="border-0 shadow-sm rounded-4 overflow-hidden"
        style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-glass)' }}
      >
        {/* HEADER: title + dept badge */}
        <div
          className="p-4 p-md-5"
          style={{
            background: 'linear-gradient(135deg, rgba(30,58,138,0.06) 0%, rgba(245,158,11,0.08) 100%)',
            borderBottom: '1px solid var(--border-glass)',
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: '44px', height: '44px', backgroundColor: 'rgba(245,158,11,0.15)' }}
            >
              <BellFill size={22} className="text-warning" />
            </div>
            <Badge bg={deptBadge.bg} className="px-3 py-2 fw-semibold d-inline-flex align-items-center" style={{ fontSize: '0.8rem' }}>
              {deptBadge.icon} {dept}
            </Badge>
            <Badge bg="light" text="dark" className="px-3 py-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
              <CalendarEvent className="me-1" size={12} />
              {createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Badge>
          </div>

          <h2
            className="fw-bold mb-0"
            style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', lineHeight: 1.35 }}
          >
            {announcement.title}
          </h2>
        </div>

        {/* BODY: meta + content */}
        <div className="p-4 p-md-5">
          <div
            className="d-flex flex-wrap gap-3 mb-4 pb-4"
            style={{ borderBottom: '1px dashed var(--border-glass)', fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <CalendarEvent size={16} className="text-primary" />
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>Đăng ngày:</strong>{' '}
                {createdAt.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
            {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
              <div className="d-flex align-items-center gap-2">
                <ClockHistory size={16} className="text-warning" />
                <span>
                  <strong style={{ color: 'var(--text-primary)' }}>Cập nhật:</strong>{' '}
                  {updatedAt.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          <article
            className="announcement-content"
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.05rem',
              lineHeight: 1.75,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {announcement.content}
          </article>

          <div
            className="mt-5 pt-4 d-flex justify-content-between align-items-center flex-wrap gap-2"
            style={{ borderTop: '1px solid var(--border-glass)' }}
          >
            <Link
              to="/announcements-list"
              className="text-decoration-none small"
              style={{ color: 'var(--primary)' }}
            >
              ← Xem các thông báo khác
            </Link>
            <span className="text-secondary small">Mã thông báo: #{announcement.id}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnnouncementDetail;
