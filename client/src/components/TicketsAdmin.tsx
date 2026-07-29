import React, { useState, useEffect, FormEvent } from 'react';
import {
  ArrowRepeat, ExclamationTriangleFill, CheckCircleFill, Tools, ChatLeftTextFill,
  PencilFill, TrashFill, Save2Fill, XLg, Search, PersonBadgeFill,
  ExclamationOctagonFill, HourglassSplit, Check2All, HouseDoorFill, ChatQuoteFill,
} from 'react-bootstrap-icons';

interface RoomLite {
  id: number;
  room_name: string;
}

interface ReporterLite {
  id: number;
  full_name: string;
  mssv: string;
  email: string;
  phone?: string;
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
  user?: ReporterLite;
}

interface TicketsAdminProps {
  token: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending: { label: 'Chờ xử lý', cls: 'badge-unpaid', icon: <HourglassSplit /> },
  processing: { label: 'Đang xử lý', cls: 'badge', icon: <ChatQuoteFill /> },
  completed: { label: 'Đã xong', cls: 'badge-paid', icon: <Check2All /> },
};

const URGENCY_META: Record<string, { label: string; cls: string }> = {
  low: { label: 'Thấp', cls: 'badge-paid' },
  medium: { label: 'Trung bình', cls: 'badge-warning' },
  high: { label: 'Khẩn cấp', cls: 'badge-unpaid' },
};

const TicketsAdmin: React.FC<TicketsAdminProps> = ({ token }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [editing, setEditing] = useState<Ticket | null>(null);
  const [editStatus, setEditStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [editNote, setEditNote] = useState('');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/tickets`, { headers });
      if (!res.ok) throw new Error('Không tải được danh sách ticket');
      setTickets(await res.json());
    } catch (e: any) {
      setError(e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ (http://localhost:3000).' : e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openEdit = (t: Ticket) => {
    setEditing(t);
    setEditStatus(t.status);
    setEditNote(t.admin_note || '');
  };

  const closeEdit = () => {
    setEditing(null);
    setEditStatus('pending');
    setEditNote('');
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/tickets/${editing.id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: editStatus, admin_note: editNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật ticket');
      setSuccess(`Đã cập nhật ticket #${editing.id} sang trạng thái "${STATUS_META[editStatus].label}"`);
      closeEdit();
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Xóa ticket #${id}? Hành động này không thể hoàn tác.`)) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/tickets/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xóa ticket');
      setSuccess(data.message || 'Đã xóa ticket');
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 className="d-flex align-items-center justify-content-center gap-2">
          <ArrowRepeat size={28} /> Đang tải danh sách sự cố...
        </h2>
      </div>
    );
  }

  const filtered = tickets.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.room?.room_name || '').toLowerCase().includes(q) ||
      (t.user?.full_name || '').toLowerCase().includes(q) ||
      (t.user?.mssv || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchUrgency = urgencyFilter === 'all' || t.urgency === urgencyFilter;
    return matchSearch && matchStatus && matchUrgency;
  });

  // Thống kê nhanh
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    processing: tickets.filter((t) => t.status === 'processing').length,
    completed: tickets.filter((t) => t.status === 'completed').length,
    high: tickets.filter((t) => t.urgency === 'high' && t.status !== 'completed').length,
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="d-flex align-items-center gap-2 mb-1" style={{ color: 'var(--text-primary)' }}>
            <Tools /> Quản lý Báo cáo sự cố
          </h3>
          <p className="text-secondary mb-0">Theo dõi và xử lý các yêu cầu sửa chữa từ sinh viên.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={busy} style={{ width: 'auto' }}>
          <ArrowRepeat /> Làm mới
        </button>
      </div>

      {error && <div className="alert alert-danger"><ExclamationTriangleFill /> {error}</div>}
      {success && <div className="alert alert-success"><CheckCircleFill /> {success}</div>}

      {/* Thẻ thống kê */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon icon-invoices"><ChatLeftTextFill size={26} /></div>
          <div className="stat-info">
            <span className="stat-label">Tổng ticket</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-unpaid"><HourglassSplit size={26} /></div>
          <div className="stat-info">
            <span className="stat-label">Chờ xử lý</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-rooms"><ChatQuoteFill size={26} /></div>
          <div className="stat-info">
            <span className="stat-label">Đang xử lý</span>
            <span className="stat-value">{stats.processing}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-revenue"><ExclamationOctagonFill size={26} /></div>
          <div className="stat-info">
            <span className="stat-label">Khẩn cấp (chưa xong)</span>
            <span className="stat-value">{stats.high}</span>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Tìm tiêu đề, mô tả, phòng, sinh viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <select className="form-input form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Đã xong</option>
          </select>
          <select className="form-input form-select" value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">Tất cả mức</option>
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Khẩn cấp</option>
          </select>
        </div>
      </div>

      {/* Danh sách ticket */}
      <div className="glass-panel">
        <h2 className="section-title"><ChatLeftTextFill className="text-primary" /> Danh sách ticket ({filtered.length}/{tickets.length})</h2>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            Không có ticket nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table" style={{ fontSize: '0.88rem' }}>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Tiêu đề</th>
                  <th>Sinh viên</th>
                  <th>Phòng</th>
                  <th>Mức</th>
                  <th>Trạng thái</th>
                  <th>Ngày gửi</th>
                  <th>Ảnh</th>
                  <th style={{ textAlign: 'center', width: 130 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const statusMeta = STATUS_META[t.status];
                  const urgencyMeta = URGENCY_META[t.urgency];
                  return (
                    <tr key={t.id}>
                      <td><strong>#{t.id}</strong></td>
                      <td>
                        <strong>{t.title}</strong>
                        <div className="text-muted small" style={{ maxWidth: 280, whiteSpace: 'normal' }}>
                          {t.description.length > 80 ? `${t.description.slice(0, 80)}…` : t.description}
                        </div>
                        {t.admin_note && (
                          <div className="small mt-1" style={{ color: 'var(--primary)' }}>
                            <em>📝 {t.admin_note}</em>
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{t.user?.full_name || `User #${t.user_id}`}</strong>
                        <div className="small text-muted">{t.user?.mssv || '—'}</div>
                      </td>
                      <td><span className="fw-bold" style={{ color: 'var(--primary)' }}><HouseDoorFill /> {t.room?.room_name || `Phòng #${t.room_id}`}</span></td>
                      <td><span className={`badge ${urgencyMeta.cls}`}>{urgencyMeta.label}</span></td>
                      <td><span className={`badge ${statusMeta.cls}`}>{statusMeta.icon} {statusMeta.label}</span></td>
                      <td className="small">{new Date(t.created_at).toLocaleString('vi-VN')}</td>
                      <td>
                        {t.image_url ? (
                          <a href={t.image_url} target="_blank" rel="noreferrer">Xem</a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="actions-cell" style={{ justifyContent: 'center' }}>
                          <button className="btn-icon" title="Cập nhật trạng thái" onClick={() => openEdit(t)} disabled={busy}>
                            <PencilFill size={14} />
                          </button>
                          <button className="btn-icon btn-icon-danger" title="Xóa" onClick={() => handleDelete(t.id)} disabled={busy}>
                            <TrashFill size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal cập nhật trạng thái */}
      {editing && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
        >
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '16px', maxWidth: '600px', width: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <PersonBadgeFill /> Xử lý ticket #{editing.id}
              </h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={closeEdit}>
                <XLg size={18} />
              </button>
            </div>

            <div className="alert alert-light" style={{ marginBottom: '1rem' }}>
              <strong>{editing.title}</strong>
              <div className="text-secondary small mt-1" style={{ whiteSpace: 'pre-wrap' }}>{editing.description}</div>
              <div className="small mt-1">
                Phòng: <strong>{editing.room?.room_name}</strong> · Sinh viên: <strong>{editing.user?.full_name}</strong>
              </div>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-input form-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Đã xong</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú của Admin (sinh viên sẽ thấy)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="VD: Đã cử thợ đến kiểm tra, dự kiến xong trong 2 ngày..."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>
              <div className="d-flex gap-2 justify-content-end mt-3">
                <button type="button" className="btn btn-secondary" onClick={closeEdit} disabled={busy} style={{ width: 'auto' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: 'auto' }}>
                  <Save2Fill /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsAdmin;