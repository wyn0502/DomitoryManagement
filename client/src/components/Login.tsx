import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface Room {
  id: number;
  room_name: string;
  price: number;
  building?: {
    building_name: string;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  room_id: number | null;
  room_name: string | null;
  full_name: string;
}

interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    full_name: '',
    phone: '',
    room_id: '',
    role: 'student',
    mssv: '',
    class_name: '',
    hometown: '',
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch rooms list for registration selection
  useEffect(() => {
    if (isRegister) {
      fetch('http://localhost:3000/api/rooms')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setRooms(data);
          }
        })
        .catch((err) => console.error('Lỗi tải danh sách phòng:', err));
    }
  }, [isRegister]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    setError('');
    if (!formData.username.trim()) return 'Tên đăng nhập không được để trống';
    if (formData.password.length < 6) return 'Mật khẩu phải chứa ít nhất 6 ký tự';

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        return 'Xác nhận mật khẩu không trùng khớp';
      }
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        return 'Email không hợp lệ';
      }
      if (!formData.full_name.trim()) return 'Họ tên không được để trống';
      if (formData.role === 'student' && !formData.room_id) {
        return 'Vui lòng chọn phòng ở';
      }
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const url = isRegister 
      ? 'http://localhost:3000/api/auth/register' 
      : 'http://localhost:3000/api/auth/login';

    const payload = isRegister
      ? {
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim(),
          role: formData.role,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          room_id: formData.role === 'admin' ? null : parseInt(formData.room_id, 10),
          mssv: formData.mssv.trim() || null,
          class_name: formData.class_name.trim() || null,
          hometown: formData.hometown.trim() || null,
        }
      : {
          username: formData.username.trim(),
          password: formData.password,
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isRegister ? 'Đăng ký thất bại' : 'Đăng nhập thất bại'));
      }

      if (isRegister) {
        setSuccess('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        setIsRegister(false);
        setFormData((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
      } else {
        // Đăng nhập thành công, truyền token và user lên App
        onLoginSuccess(data.access_token, data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi xử lý hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span>🏢</span> <span className="nav-logo-accent">DORM_KTX</span>
          </div>
          <h1 className="auth-title">
            {isRegister ? 'Đăng Ký Tài Khoản' : 'Chào Mừng Trở Lại'}
          </h1>
          <p className="auth-subtitle">
            {isRegister 
              ? 'Tạo tài khoản sinh viên nội trú ký túc xá' 
              : 'Hệ thống quản lý tài chính & thanh toán PayOS'}
          </p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input form-select"
              >
                <option value="student">Sinh Viên</option>
                <option value="admin">Quản Trị Viên (Admin)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập..."
              className="form-input"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Địa chỉ Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vd: student1@school.edu.vn"
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
              className="form-input"
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu..."
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Họ và Tên</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên có dấu..."
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại..."
                  className="form-input"
                />
              </div>

              {formData.role === 'student' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Mã số sinh viên (MSSV)</label>
                    <input
                      type="text"
                      name="mssv"
                      value={formData.mssv}
                      onChange={handleChange}
                      placeholder="Nhập mã số sinh viên..."
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lớp</label>
                    <input
                      type="text"
                      name="class_name"
                      value={formData.class_name}
                      onChange={handleChange}
                      placeholder="Nhập tên lớp..."
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quê quán</label>
                    <input
                      type="text"
                      name="hometown"
                      value={formData.hometown}
                      onChange={handleChange}
                      placeholder="Nhập quê quán..."
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phòng ký túc xá đăng ký</label>
                    <select
                      name="room_id"
                      value={formData.room_id}
                      onChange={handleChange}
                      className="form-input form-select"
                      required
                    >
                      <option value="">-- Chọn phòng ký túc xá --</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.room_name} - {room.building ? room.building.building_name : ''} ({Number(room.price).toLocaleString('vi-VN')} đ/tháng)
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản sinh viên?'}
          </span>{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isRegister ? 'Đăng nhập ngay' : 'Đăng ký tại đây'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
