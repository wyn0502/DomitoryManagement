import React, { useState, useEffect } from 'react';
import {
  DoorOpenFill, CheckCircleFill, ExclamationTriangleFill, HouseDoorFill,
  InfoCircleFill, BoxArrowInRight, HourglassSplit,
} from 'react-bootstrap-icons';

interface User {
  id: number;
  full_name: string;
  room_id: number | null;
  room_name: string | null;
  room_status?: string;
}

interface Room {
  id: number;
  room_name: string;
  type?: string;
  capacity?: number;
  current_occupancy?: number;
  fixed_rent?: number;
  price?: number;
}

interface RoomRegistrationProps {
  token: string;
  user: User;
  onRoomRequested: () => void;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const RoomRegistration: React.FC<RoomRegistrationProps> = ({ token, user, onRoomRequested }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [requested, setRequested] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${API}/api/rooms`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setRooms(data); })
      .catch(() => setError('Không tải được danh sách phòng'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) { setError('Vui lòng chọn phòng ở'); return; }
    if (!agreed) { setError('Bạn cần cam kết tuân thủ nội quy ký túc xá'); return; }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/register-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ room_id: parseInt(selectedRoom, 10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gửi yêu cầu thất bại');
      setRequested(true);
      onRoomRequested();
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  // 1) Đã được xếp phòng (approved)
  if (user.room_id) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{ maxWidth: '640px' }}>
          <div className="d-flex align-items-center gap-2 mb-3" style={{ color: 'var(--success)' }}>
            <CheckCircleFill size={24} />
            <h2 className="mb-0" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Bạn đã được xếp phòng ở</h2>
          </div>
          <p className="text-secondary mb-3">Ban quản lý đã duyệt và xếp bạn vào phòng dưới đây. Mỗi sinh viên chỉ ở một phòng.</p>
          <div className="d-flex align-items-center gap-2 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-glass)' }}>
            <HouseDoorFill size={22} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{user.room_name}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2) Đang chờ Admin duyệt (pending)
  if (requested || user.room_status === 'pending') {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel" style={{ maxWidth: '640px' }}>
          <div className="d-flex align-items-center gap-2 mb-3" style={{ color: 'var(--warning)' }}>
            <HourglassSplit size={24} />
            <h2 className="mb-0" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Yêu cầu đang chờ duyệt</h2>
          </div>
          <p className="text-secondary mb-0">Bạn đã gửi yêu cầu đăng ký phòng. Vui lòng chờ <strong>Ban quản lý ký túc xá (Admin)</strong> duyệt. Sau khi được duyệt, thông tin phòng sẽ xuất hiện trong hồ sơ của bạn (đăng nhập lại để cập nhật).</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }} className="text-secondary">Đang tải danh sách phòng...</div>;
  }

  // 3) Chưa đăng ký / bị từ chối -> hiện form
  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ maxWidth: '720px' }}>
        <h2 className="section-title"><DoorOpenFill className="text-primary" /> Đơn đăng ký phòng ở Ký túc xá</h2>

        {user.room_status === 'rejected' && (
          <div className="alert alert-warning"><ExclamationTriangleFill /> Yêu cầu trước của bạn đã bị từ chối. Bạn có thể gửi lại yêu cầu mới.</div>
        )}

        <div className="d-flex align-items-center gap-2 p-3 rounded-3 mb-4" style={{ backgroundColor: 'rgba(30,58,138,0.06)', border: '1px solid rgba(30,58,138,0.15)' }}>
          <InfoCircleFill style={{ color: 'var(--primary)' }} />
          <span className="small text-secondary">Sinh viên: <strong style={{ color: 'var(--text-primary)' }}>{user.full_name}</strong> — Chọn phòng còn chỗ và cam kết nội quy. Yêu cầu sẽ được gửi tới Admin để duyệt.</span>
        </div>

        {error && <div className="alert alert-danger"><ExclamationTriangleFill /> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Chọn phòng ở</label>
            <select className="form-input form-select" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} required>
              <option value="">-- Chọn phòng --</option>
              {rooms.map((room) => {
                const occ = room.current_occupancy ?? 0;
                const cap = room.capacity ?? 0;
                const full = cap > 0 && occ >= cap;
                return (
                  <option key={room.id} value={room.id} disabled={full}>
                    {room.room_name} — {room.type || 'Thường'} — {Number(room.fixed_rent || room.price || 0).toLocaleString('vi-VN')}đ/tháng — {occ}/{cap} {full ? '(Đã đầy)' : '(Còn chỗ)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label className="d-flex align-items-start gap-2" style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: '0.25rem' }} />
              <span>Tôi đã đọc <strong className="text-dark">Bản nội quy phòng ở sinh viên</strong> và cam kết tuân thủ nội quy; cam kết trả phí ký túc xá đầy đủ, đúng thời hạn.</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: 'auto' }}>
            <BoxArrowInRight /> {submitting ? 'Đang gửi...' : 'Gửi yêu cầu đăng ký phòng'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomRegistration;
