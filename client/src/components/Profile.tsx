import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import {
  PersonVcard, BookmarkStar, Building, CheckCircleFill, ExclamationTriangleFill,
  PersonCircle,
} from 'react-bootstrap-icons';

interface Room {
  id: number;
  room_name: string;
  capacity: number;
  type: string;
  fixed_rent: number;
}

interface FullUserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  room_id: number | null;
  full_name: string;
  mssv: string;
  hometown: string;
  phone: string;
  class_name: string;
  room: Room | null;
  created_at: string;
}

interface ProfileProps {
  token: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Hiển thị giá trị thật, nếu trống thì "Chưa cập nhật"
const val = (v?: string | null) => (v && String(v).trim() ? v : 'Chưa cập nhật');

const Field: React.FC<{ label: string; value?: string | null; className?: string }> = ({ label, value, className }) => (
  <Col sm={6} className={className}>
    <div className="text-secondary text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>{label}</div>
    <div className="fw-semibold text-dark">{val(value)}</div>
  </Col>
);

const Profile: React.FC<ProfileProps> = ({ token }) => {
  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Không thể lấy thông tin cá nhân từ máy chủ.');
        setProfile(await res.json());
      } catch (err: any) {
        setError(err.message || 'Lỗi hệ thống');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Đang tải thông tin cá nhân...</span>
      </div>
    );
  }

  if (error || !profile) {
    return <Alert variant="danger"><ExclamationTriangleFill /> {error || 'Không tìm thấy thông tin profile'}</Alert>;
  }

  const createdDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'Chưa cập nhật';

  return (
    <div className="profile-container animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div className="mb-4">
        <h4 className="fw-bold d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
          <PersonVcard className="me-2 text-primary" size={24} />
          Thông tin chi tiết Sinh viên
        </h4>
        <hr className="mt-1" />
      </div>

      {/* Hồ sơ cơ bản (dữ liệu THẬT từ DB) */}
      <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-glass)' }}>
        <h5 className="fw-bold mb-4 text-primary" style={{ borderBottom: '2px solid rgba(30, 58, 138, 0.15)', paddingBottom: '0.5rem' }}>
          {val(profile.mssv)} — {val(profile.full_name)}
        </h5>

        <Row className="g-4">
          <Col md={4} className="d-flex flex-column align-items-center border-end pb-3" style={{ borderColor: 'var(--border-glass)' }}>
            <div
              className="rounded-4 d-flex align-items-center justify-content-center mb-3 shadow-sm"
              style={{ width: '160px', height: '160px', backgroundColor: 'rgba(30,58,138,0.08)', color: 'var(--primary)' }}
            >
              <PersonCircle size={110} />
            </div>
            <div className="text-center">
              <span className="badge bg-primary px-3 py-2 rounded-pill fw-semibold text-uppercase">
                {profile.role === 'admin' ? 'Quản trị viên' : 'Sinh viên nội trú'}
              </span>
            </div>
          </Col>

          <Col md={8}>
            <h6 className="fw-bold text-warning mb-3">Thông tin tài khoản</h6>
            <Row className="g-3">
              <Field label="Họ và tên" value={profile.full_name} />
              <Field label="Tên đăng nhập" value={profile.username} />
              <Field label="Email" value={profile.email} />
              <Field label="Số điện thoại" value={profile.phone} />
              <Field label="Địa chỉ thường trú (Quê quán)" value={profile.hometown} className="col-12" />
              <Col sm={6}>
                <div className="text-secondary text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>Ngày tạo tài khoản</div>
                <div className="fw-semibold text-dark">{createdDate}</div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Học tập & cư trú (dữ liệu THẬT từ DB) */}
      <Card className="border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-glass)' }}>
        <h5 className="fw-bold mb-4 text-warning" style={{ borderBottom: '2px solid rgba(245, 158, 11, 0.2)', paddingBottom: '0.5rem' }}>
          Thông tin học tập & cư trú Ký túc xá
        </h5>

        <Row className="g-4">
          <Col md={6}>
            <div className="d-flex align-items-center mb-3">
              <BookmarkStar className="text-primary me-2" size={20} />
              <h6 className="fw-bold mb-0 text-dark">Thông tin học tập</h6>
            </div>
            <Row className="g-3">
              <Field label="Mã sinh viên (MSSV)" value={profile.mssv} />
              <Field label="Lớp quản lý" value={profile.class_name} />
            </Row>
          </Col>

          <Col md={6} className="border-start ps-md-4" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="d-flex align-items-center mb-3">
              <Building className="text-success me-2" size={20} />
              <h6 className="fw-bold mb-0 text-dark">Thông tin ký túc xá</h6>
            </div>
            {profile.room ? (
              <Row className="g-3">
                <Field label="Phòng ở" value={profile.room.room_name} />
                <Field label="Loại phòng" value={`${profile.room.type || 'Thường'} (Tối đa ${profile.room.capacity || 0} người)`} />
                <Field label="Đơn giá tiền phòng" value={`${Number(profile.room.fixed_rent || 0).toLocaleString('vi-VN')} đ/tháng`} />
                <Col sm={6}>
                  <div className="text-secondary text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>Trạng thái cư trú</div>
                  <div className="fw-semibold text-success d-flex align-items-center gap-1"><CheckCircleFill /> Đang nội trú</div>
                </Col>
              </Row>
            ) : (
              <div className="text-secondary py-2">Chưa đăng ký phòng ở. Vào mục <strong>"Đăng ký phòng ở"</strong> để đăng ký.</div>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Profile;
