import React, { useState, useEffect } from 'react';
import {
  PeopleFill, CheckCircleFill, XCircleFill, ExclamationTriangleFill, ArrowRepeat,
  PencilFill, TrashFill, HourglassSplit, Save2Fill,
} from 'react-bootstrap-icons';

interface RoomLite { room_name: string }
interface UserRow {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name: string;
  mssv: string;
  phone: string;
  class_name: string;
  hometown: string;
  room_id: number | null;
  room_status: string;
  pending_room_name?: string | null;
  room?: RoomLite | null;
}

interface StudentsAdminProps { token: string }

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const StudentsAdmin: React.FC<StudentsAdminProps> = ({ token }) => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pending, setPending] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserRow>>({});

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [uRes, pRes] = await Promise.all([
        fetch(`${API}/api/users`, { headers }),
        fetch(`${API}/api/users/pending-rooms`, { headers }),
      ]);
      if (!uRes.ok || !pRes.ok) throw new Error('Không tải được danh sách người dùng');
      setUsers(await uRes.json());
      setPending(await pRes.json());
    } catch (e: any) {
      setError(e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [token]);

  const act = async (url: string, method: string, okMsg: string, body?: any) => {
    setBusy(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API}${url}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Thao tác thất bại');
      setSuccess(data.message || okMsg);
      setEditId(null);
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const approve = (id: number) => act(`/api/users/${id}/approve-room`, 'POST', 'Đã duyệt');
  const reject = (id: number) => act(`/api/users/${id}/reject-room`, 'POST', 'Đã từ chối');
  const remove = (id: number, name: string) => { if (window.confirm(`Xóa người dùng "${name}"?`)) act(`/api/users/${id}`, 'DELETE', 'Đã xóa'); };
  const startEdit = (u: UserRow) => { setEditId(u.id); setEditForm({ full_name: u.full_name, phone: u.phone, mssv: u.mssv, class_name: u.class_name, hometown: u.hometown }); };
  const saveEdit = (id: number) => act(`/api/users/${id}`, 'PUT', 'Đã cập nhật', editForm);

  const statusBadge = (s: string) => {
    if (s === 'approved') return <span className="badge badge-paid">Đã có phòng</span>;
    if (s === 'pending') return <span className="badge badge-unpaid">Chờ duyệt</span>;
    if (s === 'rejected') return <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c' }}>Bị từ chối</span>;
    return <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Chưa ĐK</span>;
  };

  if (loading && users.length === 0) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}><h3 className="d-flex align-items-center justify-content-center gap-2"><ArrowRepeat size={24} /> Đang tải...</h3></div>;
  }

  const students = users.filter((u) => u.role === 'student');

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={loadData} style={{ width: 'auto' }} disabled={busy}><ArrowRepeat size={18} /> Làm mới</button>
      </div>
      {error && <div className="alert alert-danger"><ExclamationTriangleFill /> {error}</div>}
      {success && <div className="alert alert-success"><CheckCircleFill /> {success}</div>}

      {/* YÊU CẦU ĐĂNG KÝ PHÒNG CHỜ DUYỆT */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title"><HourglassSplit className="text-warning" /> Yêu cầu đăng ký phòng chờ duyệt ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-secondary mb-0">Không có yêu cầu nào đang chờ duyệt.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Sinh viên</th><th>MSSV</th><th>Phòng đăng ký</th><th style={{ textAlign: 'center' }}>Duyệt</th></tr></thead>
              <tbody>
                {pending.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.full_name || u.username}</strong></td>
                    <td>{u.mssv || '—'}</td>
                    <td><span className="badge badge-unpaid">{u.pending_room_name}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="actions-cell" style={{ justifyContent: 'center' }}>
                        <button className="btn btn-success" style={{ width: 'auto', padding: '0.35rem 0.7rem', fontSize: '0.8rem' }} onClick={() => approve(u.id)} disabled={busy}><CheckCircleFill /> Duyệt</button>
                        <button className="btn btn-danger" style={{ width: 'auto', padding: '0.35rem 0.7rem', fontSize: '0.8rem' }} onClick={() => reject(u.id)} disabled={busy}><XCircleFill /> Từ chối</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DANH SÁCH SINH VIÊN (CRUD) */}
      <div className="glass-panel">
        <h2 className="section-title"><PeopleFill className="text-primary" /> Danh sách Sinh viên ({students.length})</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Mã</th><th>Họ tên</th><th>MSSV</th><th>Email</th><th>SĐT</th><th>Lớp</th><th>Phòng</th><th>Trạng thái</th><th style={{ textAlign: 'center' }}>Thao tác</th></tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có sinh viên nào.</td></tr>
              ) : students.map((u) => (
                editId === u.id ? (
                  <tr key={u.id} style={{ background: '#f8fafc' }}>
                    <td><strong>#{u.id}</strong></td>
                    <td><input className="form-input" style={{ padding: '0.35rem' }} value={editForm.full_name || ''} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} /></td>
                    <td><input className="form-input" style={{ padding: '0.35rem', width: '90px' }} value={editForm.mssv || ''} onChange={(e) => setEditForm({ ...editForm, mssv: e.target.value })} /></td>
                    <td className="text-muted small">{u.email}</td>
                    <td><input className="form-input" style={{ padding: '0.35rem', width: '110px' }} value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></td>
                    <td><input className="form-input" style={{ padding: '0.35rem', width: '90px' }} value={editForm.class_name || ''} onChange={(e) => setEditForm({ ...editForm, class_name: e.target.value })} /></td>
                    <td>{u.room?.room_name || '—'}</td>
                    <td>{statusBadge(u.room_status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="actions-cell" style={{ justifyContent: 'center' }}>
                        <button className="btn-icon" style={{ color: 'var(--success)' }} title="Lưu" onClick={() => saveEdit(u.id)} disabled={busy}><Save2Fill size={14} /></button>
                        <button className="btn-icon" title="Hủy" onClick={() => setEditId(null)} disabled={busy}>✕</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id}>
                    <td><strong>#{u.id}</strong></td>
                    <td>{u.full_name || <span className="text-muted">(Chưa cập nhật)</span>}</td>
                    <td>{u.mssv || '—'}</td>
                    <td className="small">{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.class_name || '—'}</td>
                    <td>{u.room?.room_name || '—'}</td>
                    <td>{statusBadge(u.room_status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="actions-cell" style={{ justifyContent: 'center' }}>
                        <button className="btn-icon" title="Sửa" onClick={() => startEdit(u)} disabled={busy}><PencilFill size={14} /></button>
                        <button className="btn-icon btn-icon-danger" title="Xóa" onClick={() => remove(u.id, u.full_name || u.username)} disabled={busy}><TrashFill size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsAdmin;
