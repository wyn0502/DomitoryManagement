import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  PersonFill, KeyFill, Eye, EyeSlash, EnvelopeFill, TelephoneFill,
  PersonBadgeFill, Mortarboard, GeoAltFill, ShieldLockFill,
  QuestionCircleFill, Bank2, ExclamationTriangleFill, CheckCircleFill, BoxArrowInRight,
} from 'react-bootstrap-icons';

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

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    full_name: '',
    phone: '',
    role: 'student',
    mssv: '',
    class_name: '',
    hometown: '',
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | any>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.username.trim()) return 'Tên đăng nhập không được để trống';
    if (formData.password.length < 6) return 'Mật khẩu phải chứa ít nhất 6 ký tự';

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) return 'Xác nhận mật khẩu không trùng khớp';
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) return 'Địa chỉ email không hợp lệ';
      if (!formData.full_name.trim()) return 'Họ tên không được để trống';
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

    const url = isRegister ? `${API}/api/auth/register` : `${API}/api/auth/login`;

    const payload = isRegister
      ? {
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim(),
          role: formData.role,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          room_id: null,
          mssv: formData.mssv.trim() || null,
          class_name: formData.class_name.trim() || null,
          hometown: formData.hometown.trim() || null,
        }
      : { username: formData.username.trim(), password: formData.password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isRegister ? 'Đăng ký thất bại' : 'Đăng nhập thất bại'));
      }

      if (isRegister) {
        setSuccess('Đăng ký tài khoản thành công! Vui lòng đăng nhập, sau đó vào mục "Đăng ký phòng ở" trong hệ thống.');
        setIsRegister(false);
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        onLoginSuccess(data.access_token, data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi xử lý hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pk-login-bg">
      {/* Thương hiệu phía trên thẻ (bố cục Phenikaa) */}
      <div className="pk-brand">
        <Bank2 size={38} />
        <div>
          <span className="pk-brand-name">
            DOMITORY <span className="pk-brand-ring">●</span>
          </span>
          <span className="pk-brand-sub">KÝ TÚC XÁ SINH VIÊN</span>
        </div>
      </div>

      <div className={`pk-card ${isRegister ? 'pk-card-wide' : ''}`}>
        <h1 className="pk-title">{isRegister ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'}</h1>

        {error && (
          <div className="pk-alert pk-alert-danger">
            <ExclamationTriangleFill /> {error}
          </div>
        )}
        {success && (
          <div className="pk-alert pk-alert-success">
            <CheckCircleFill /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="pk-field">
              <label className="pk-label">Vai trò tài khoản</label>
              <div className="pk-input-group">
                <ShieldLockFill className="pk-lead-icon" size={18} />
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="student">Sinh viên</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>
          )}

          <div className={isRegister ? 'pk-grid-2' : ''}>
            {/* Tài khoản */}
            <div className="pk-field">
              <label className="pk-label">Tên đăng nhập</label>
              <div className="pk-input-group">
                <PersonFill className="pk-lead-icon" size={18} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tài khoản hoặc email"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div className="pk-field">
                <label className="pk-label">Địa chỉ Email</label>
                <div className="pk-input-group">
                  <EnvelopeFill className="pk-lead-icon" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className={isRegister ? 'pk-grid-2' : ''}>
            {/* Mật khẩu */}
            <div className="pk-field">
              <label className="pk-label">Mật khẩu</label>
              <div className="pk-input-group">
                <KeyFill className="pk-lead-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button type="button" className="pk-eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="pk-field">
                <label className="pk-label">Xác nhận mật khẩu</label>
                <div className="pk-input-group">
                  <KeyFill className="pk-lead-icon" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {isRegister && (
            <>
              <div className="pk-section-title">Thông tin hồ sơ nội trú</div>
              <div className="pk-grid-2">
                <div className="pk-field">
                  <label className="pk-label">Họ và tên</label>
                  <div className="pk-input-group">
                    <PersonBadgeFill className="pk-lead-icon" size={18} />
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Họ và tên có dấu" required />
                  </div>
                </div>
                <div className="pk-field">
                  <label className="pk-label">Số điện thoại</label>
                  <div className="pk-input-group">
                    <TelephoneFill className="pk-lead-icon" size={18} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại di động" />
                  </div>
                </div>
              </div>

              {formData.role === 'student' && (
                <>
                  <div className="pk-grid-2">
                    <div className="pk-field">
                      <label className="pk-label">Mã số sinh viên (MSSV)</label>
                      <div className="pk-input-group">
                        <PersonBadgeFill className="pk-lead-icon" size={18} />
                        <input type="text" name="mssv" value={formData.mssv} onChange={handleChange} placeholder="Mã số sinh viên" />
                      </div>
                    </div>
                    <div className="pk-field">
                      <label className="pk-label">Lớp quản lý</label>
                      <div className="pk-input-group">
                        <Mortarboard className="pk-lead-icon" size={18} />
                        <input type="text" name="class_name" value={formData.class_name} onChange={handleChange} placeholder="Ví dụ: CNTT1" />
                      </div>
                    </div>
                  </div>
                  <div className="pk-field">
                    <label className="pk-label">Quê quán</label>
                    <div className="pk-input-group">
                      <GeoAltFill className="pk-lead-icon" size={18} />
                      <input type="text" name="hometown" value={formData.hometown} onChange={handleChange} placeholder="Tỉnh/Thành phố" />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Quên mật khẩu & Trợ giúp (chỉ ở màn đăng nhập) */}
          {!isRegister && (
            <div className="pk-links">
              <button type="button" className="pk-link" onClick={() => alert('Vui lòng liên hệ Phòng Quản lý KTX để lấy lại mật khẩu.')}>
                <ShieldLockFill size={14} /> Quên mật khẩu
              </button>
              <button type="button" className="pk-link" onClick={() => alert('Hotline hỗ trợ kỹ thuật: 0988 888 888')}>
                <QuestionCircleFill size={14} /> Trợ giúp!
              </button>
            </div>
          )}

          <button type="submit" className="pk-submit" disabled={loading}>
            <BoxArrowInRight size={18} />
            {loading ? 'Đang xử lý...' : isRegister ? 'ĐĂNG KÝ HỒ SƠ' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div className="pk-switch">
          {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản sinh viên? '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
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
