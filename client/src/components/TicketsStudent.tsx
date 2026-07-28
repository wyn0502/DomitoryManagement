import React, { useState, useEffect, FormEvent } from 'react';
import {
  ArrowRepeat, ExclamationTriangleFill, CheckCircleFill, Tools, ChatLeftTextFill,
  SendFill, PlusCircleFill, HourglassSplit, ChatQuoteFill, Check2All,
  ExclamationOctagonFill, HouseDoorFill, XCircleFill, ExclamationDiamondFill,
} from 'react-bootstrap-icons';

interface UserLite {
  id: number;
  room_id: number | null;
  room_name: string | null;
  room_status?: string;
  full_name: string;
}

interface RoomLite {
  id: number;
  room_name: string;
}

interface Ticket {
  id: number;
  room_id: number;
  user_id: number;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'processing' | 'completed';
  image_url: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  room?: RoomLite;
}

interface TicketsStudentProps {
  token: string;
  user: UserLite;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending: { label: 'Chờ xử lý', cls: 'badge-unpaid', icon: <HourglassSplit /> },
  processing: { label: 'Đang xử lý', cls: 'badge', icon: <ChatQuoteFill /> },
  completed: { label: 'Đã xong', cls: 'badge-paid', icon: <Check2All /> },
};

const URGENCY_META: Record<string, { label: string; cls: string }> = {
  low: { label: 'Thấp', cls: 'badge-paid' },
  medium: { label: 'Trung bình', cls: 'badge-unpaid' },
  high: { label: 'Khẩn cấp', cls: 'badge' },
};

const URGENCY_PROMPT: Record<string, string> = {
  low: 'Sự cố nhỏ, không ảnh hưởng sinh hoạt',
  medium: 'Sự cố ảnh hưởng một phần sinh hoạt',
  high: 'Sự cố nghiêm trọng, cần xử lý gấp',
};

const TicketsStudent: React.FC<TicketsStudentProps> = ({ token, user }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [imageUrl, setImageUrl] = useState('');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const canSubmit = user.room_status === 'approved' && user.room_id;

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/tickets/mine`, { headers });
      if (!res.ok) throw new Error('Không tải được danh sách ticket của bạn');
      setTickets(await res.json());
    } catch (e: any) {
      setError(e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ (http://localhost:3000).' : e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canSubmit) loadData();
    else setLoading(false);
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          urgency,
          image_url: imageUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi ticket');
      setSuccess('Đã gửi yêu cầu sửa chữa tới Ban Quản lý KTX!');
      setTitle('');
      setDescription('');
      setUrgency('medium');
      setImageUrl('');
      setFormOpen(false);
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!canSubmit) {
    return (
      <div className="animate-fade-in">
        <div className="glass-panel text-center" style={{ padding: '2.5rem' }}>
          <XCircleFill size={48} className="text-warning mb-3" />
          <h4 className="fw-bold text-warning">Bạn chưa được xếp phòng</h4>
          <p className="text-secondary mb-3">
            Chỉ sinh viên đang cư trú tại KTX mới có thể gửi báo cáo sự cố.
            Vui lòng đăng ký và được Admin duyệt phòng trước.
          </p>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => window.history.back()}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 className="d-flex align-items-center justify-content-center gap-2">
          <ArrowRepeat size={28} /> Đang tải danh sách ticket...
        </h2>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="d-flex align-items-center gap-2 mb-1" style={{ color: 'var(--text-primary)' }}>
            <Tools /> Báo cáo sự cố / Yêu cầu sửa chữa
          </h3>
          <p className="text-secondary mb-0">
            Phòng của bạn: <strong style={{ color: 'var(--primary)' }}><HouseDoorFill /> {user.room_name || `Phòng #${user.room_id}`}</strong>
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={loadData} disabled={busy} style={{ width: 'auto' }}>
            <ArrowRepeat /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={() => setFormOpen(!formOpen)} style={{ width: 'auto' }}>
            {formOpen ? 'Đóng form' : <><PlusCircleFill /> Gửi yêu cầu mới</>}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger"><ExclamationTriangleFill /> {error}</div>}
      {success && <div className="alert alert-success"><CheckCircleFill /> {success}</div>}

      {/* Form gửi ticket */}
      {formOpen && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
          <h2 className="section-title"><SendFill className="text-primary" /> Gửi yêu cầu sửa chữa mới</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tiêu đề *</label>
              <input
                className="form-input"
                placeholder="VD: Điều hòa phòng không mát, quạt trần kêu to..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả chi tiết *</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Mô tả rõ hiện trạng sự cố, thời điểm xảy ra..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group mb-0">
                <label className="form-label">Mức độ khẩn cấp</label>
                <select
                  className="form-input form-select"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                >
                  <option value="low">🟢 Thấp — {URGENCY_PROMPT.low}</option>
                  <option value="medium">🟡 Trung bình — {URGENCY_PROMPT.medium}</option>
                  <option value="high">🔴 Khẩn cấp — {URGENCY_PROMPT.high}</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Ảnh minh chứng (URL, không bắt buộc)</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-success" disabled={busy} style={{ width: 'auto' }}>
                <SendFill /> Gửi yêu cầu
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)} disabled={busy} style={{ width: 'auto' }}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách ticket của sinh viên */}
      <div className="glass-panel">
        <h2 className="section-title"><ChatLeftTextFill className="text-primary" /> Ticket của tôi ({tickets.length})</h2>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <ExclamationDiamondFill size={36} className="mb-2 d-block mx-auto" />
            Bạn chưa gửi báo cáo sự cố nào. Mọi thứ đang ổn? 🎉
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Tiêu đề</th>
                  <th>Mức</th>
                  <th>Trạng thái</th>
                  <th>Phản hồi của Admin</th>
                  <th>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const statusMeta = STATUS_META[t.status];
                  const urgencyMeta = URGENCY_META[t.urgency];
                  return (
                    <tr key={t.id}>
                      <td><strong>#{t.id}</strong></td>
                      <td>
                        <strong>{t.title}</strong>
                        <div className="text-muted small" style={{ maxWidth: 380, whiteSpace: 'normal' }}>
                          {t.description}
                        </div>
                        {t.image_url && (
                          <a href={t.image_url} target="_blank" rel="noreferrer" className="small">📷 Xem ảnh</a>
                        )}
                      </td>
                      <td><span className={`badge ${urgencyMeta.cls}`}>{urgencyMeta.label}</span></td>
                      <td><span className={`badge ${statusMeta.cls}`}>{statusMeta.icon} {statusMeta.label}</span></td>
                      <td style={{ maxWidth: 240, fontSize: '0.85rem' }}>
                        {t.admin_note ? (
                          <em style={{ color: 'var(--primary)' }}>📝 {t.admin_note}</em>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="small">{new Date(t.created_at).toLocaleString('vi-VN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsStudent;