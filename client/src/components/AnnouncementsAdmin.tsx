import React, { useState, useEffect, FormEvent } from 'react';
import {
  ArrowRepeat, ExclamationTriangleFill, CheckCircleFill, MegaphoneFill,
  PlusCircleFill, PencilFill, TrashFill, Save2Fill, XLg, CalendarEvent,
  ChatLeftTextFill, Search,
} from 'react-bootstrap-icons';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface AnnouncementsAdminProps {
  token: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const AnnouncementsAdmin: React.FC<AnnouncementsAdminProps> = ({ token }) => {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const emptyForm = { title: '', content: '' };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/announcements`, { headers });
      if (!res.ok) throw new Error('Không tải được danh sách thông báo');
      setList(await res.json());
    } catch (e: any) {
      setError(e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const url = editingId ? `${API}/api/announcements/${editingId}` : `${API}/api/announcements`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ title: form.title.trim(), content: form.content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi lưu thông báo');
      setSuccess(editingId ? 'Đã cập nhật thông báo!' : 'Đã đăng thông báo mới!');
      setForm(emptyForm);
      setEditingId(null);
      setFormOpen(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (a: Announcement) => {
    setEditingId(a.id);
    setForm({ title: a.title, content: a.content });
    setFormOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(false);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Xóa thông báo "${title}"?`)) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/announcements/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xóa thông báo');
      setSuccess(data.message || 'Đã xóa thông báo');
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading && list.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 className="d-flex align-items-center justify-content-center gap-2">
          <ArrowRepeat size={28} /> Đang tải bảng tin...
        </h2>
      </div>
    );
  }

  const filtered = list.filter((a) =>
    !searchQuery.trim() ||
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="d-flex align-items-center gap-2 mb-1" style={{ color: 'var(--text-primary)' }}>
            <MegaphoneFill /> Quản lý Bảng tin Thông báo
          </h3>
          <p className="text-secondary mb-0">Đăng thông báo cho toàn bộ sinh viên ký túc xá.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={load} disabled={busy} style={{ width: 'auto' }}>
            <ArrowRepeat /> Làm mới
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (formOpen) cancelEdit();
              else setFormOpen(true);
            }}
            disabled={busy}
            style={{ width: 'auto' }}
          >
            {formOpen ? <><XLg /> Đóng form</> : <><PlusCircleFill /> Đăng thông báo</>}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger"><ExclamationTriangleFill /> {error}</div>}
      {success && <div className="alert alert-success"><CheckCircleFill /> {success}</div>}

      {/* Form */}
      {formOpen && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
          <h2 className="section-title">
            <ChatLeftTextFill className="text-primary" /> {editingId ? `Sửa thông báo #${editingId}` : 'Đăng thông báo mới'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tiêu đề *</label>
              <input
                className="form-input"
                placeholder="VD: Lịch cắt nước tòa A ngày 15/07"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung *</label>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Nhập nội dung chi tiết..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success" disabled={busy} style={{ width: 'auto' }}>
                <Save2Fill /> {editingId ? 'Lưu thay đổi' : 'Đăng thông báo'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={busy} style={{ width: 'auto' }}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách thông báo */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="section-title mb-0">
            <MegaphoneFill className="text-warning" /> Danh sách thông báo ({filtered.length}/{list.length})
          </h2>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Tìm tiêu đề hoặc nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            Chưa có thông báo nào trong hệ thống.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Tiêu đề</th>
                  <th>Nội dung</th>
                  <th>Ngày đăng</th>
                  <th style={{ textAlign: 'center', width: 130 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td><strong>#{a.id}</strong></td>
                    <td><strong>{a.title}</strong></td>
                    <td className="text-secondary" style={{ maxWidth: 400, whiteSpace: 'normal' }}>
                      {a.content.length > 120 ? `${a.content.slice(0, 120)}…` : a.content}
                    </td>
                    <td className="small">
                      <CalendarEvent /> {new Date(a.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="actions-cell" style={{ justifyContent: 'center' }}>
                        <button className="btn-icon" title="Sửa" onClick={() => startEdit(a)} disabled={busy}>
                          <PencilFill size={14} />
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Xóa" onClick={() => handleDelete(a.id, a.title)} disabled={busy}>
                          <TrashFill size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsAdmin;