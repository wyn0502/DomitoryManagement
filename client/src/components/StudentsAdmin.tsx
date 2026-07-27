import React, { useState, useEffect } from 'react';
import {
  PeopleFill, CheckCircleFill, XCircleFill, ExclamationTriangleFill, ArrowRepeat,
  PencilFill, TrashFill, HourglassSplit, PersonPlusFill, Search, XLg,
  Save2Fill, DoorOpenFill,
} from 'react-bootstrap-icons';

interface RoomLite {
  id: number;
  room_name: string;
  capacity?: number;
  current_occupancy?: number;
  type?: string;
}

interface UserRow {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name: string;
  mssv: string;
  cccd?: string;
  gender?: string;
  phone: string;
  class_name: string;
  hometown: string;
  room_id: number | null;
  room_status: string;
  pending_room_name?: string | null;
  room?: RoomLite | null;
}

interface StudentsAdminProps {
  token: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const StudentsAdmin: React.FC<StudentsAdminProps> = ({ token }) => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pending, setPending] = useState<UserRow[]>([]);
  const [rooms, setRooms] = useState<RoomLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const emptyForm = {
    username: '',
    password: '',
    email: '',
    full_name: '',
    mssv: '',
    cccd: '',
    gender: 'Nam',
    phone: '',
    class_name: '',
    hometown: '',
    room_id: '',
    room_status: 'none',
  };

  const [formData, setFormData] = useState(emptyForm);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [uRes, pRes, rRes] = await Promise.all([
        fetch(`${API}/api/users`, { headers }),
        fetch(`${API}/api/users/pending-rooms`, { headers }),
        fetch(`${API}/api/rooms`, { headers }),
      ]);
      if (!uRes.ok || !pRes.ok || !rRes.ok) throw new Error('Không tải được dữ liệu từ máy chủ');
      setUsers(await uRes.json());
      setPending(await pRes.json());
      setRooms(await rRes.json());
    } catch (e: any) {
      setError(e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const act = async (url: string, method: string, okMsg: string, body?: any) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}${url}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Thao tác thất bại');
      setSuccess(data.message || okMsg);
      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const approve = (id: number) => act(`/api/users/${id}/approve-room`, 'POST', 'Đã duyệt phòng thành công!');
  const reject = (id: number) => act(`/api/users/${id}/reject-room`, 'POST', 'Đã từ chối yêu cầu đăng ký phòng');
  const remove = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sinh viên "${name}" khỏi hệ thống?`)) {
      act(`/api/users/${id}`, 'DELETE', 'Đã xóa sinh viên thành công!');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserRow) => {
    setModalMode('edit');
    setSelectedUser(u);
    setFormData({
      username: u.username || '',
      password: '',
      email: u.email || '',
      full_name: u.full_name || '',
      mssv: u.mssv || '',
      cccd: u.cccd || '',
      gender: u.gender || 'Nam',
      phone: u.phone || '',
      class_name: u.class_name || '',
      hometown: u.hometown || '',
      room_id: u.room_id ? String(u.room_id) : '',
      room_status: u.room_status || 'none',
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      room_id: formData.room_id ? parseInt(formData.room_id, 10) : null,
    };
    if (modalMode === 'create') {
      act('/api/users', 'POST', 'Thêm sinh viên thành công!', payload);
    } else if (selectedUser) {
      act(`/api/users/${selectedUser.id}`, 'PUT', 'Cập nhật thông tin sinh viên thành công!', payload);
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'approved') return <span className="badge badge-paid">Đã có phòng</span>;
    if (s === 'pending') return <span className="badge badge-unpaid">Chờ duyệt</span>;
    if (s === 'rejected') return <span className="badge" style={{ background: '#fef2f2', color: '#b91c1c' }}>Bị từ chối</span>;
    return <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Chưa ĐK</span>;
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h3 className="d-flex align-items-center justify-content-center gap-2">
          <ArrowRepeat size={24} /> Đang tải danh sách sinh viên...
        </h3>
      </div>
    );
  }

  const students = users.filter((u) => u.role === 'student');

  const filteredStudents = students.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.mssv && u.mssv.toLowerCase().includes(q)) ||
      (u.cccd && u.cccd.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.class_name && u.class_name.toLowerCase().includes(q)) ||
      (u.hometown && u.hometown.toLowerCase().includes(q)) ||
      (u.room?.room_name && u.room.room_name.toLowerCase().includes(q)) ||
      (u.pending_room_name && u.pending_room_name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || u.room_status === statusFilter;

    const matchesRoom =
      roomFilter === 'all' ||
      (roomFilter === 'unassigned' && !u.room_id) ||
      (u.room_id && String(u.room_id) === roomFilter);

    return matchesSearch && matchesStatus && matchesRoom;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={openCreateModal} disabled={busy}>
            <PersonPlusFill size={18} /> Thêm sinh viên mới
          </button>
          <button className="btn btn-secondary" onClick={loadData} disabled={busy} style={{ width: 'auto' }}>
            <ArrowRepeat size={18} /> Làm mới
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger"><ExclamationTriangleFill /> {error}</div>}
      {success && <div className="alert alert-success"><CheckCircleFill /> {success}</div>}

      {/* YÊU CẦU ĐĂNG KÝ PHÒNG CHỜ DUYỆT */}
      {pending.length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '2rem', border: '1px solid var(--accent)' }}>
          <h2 className="section-title"><HourglassSplit className="text-warning" /> Yêu cầu đăng ký phòng chờ duyệt ({pending.length})</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sinh viên</th>
                  <th>MSSV</th>
                  <th>Phòng đăng ký</th>
                  <th style={{ textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.full_name || u.username}</strong> ({u.email})</td>
                    <td>{u.mssv || '—'}</td>
                    <td><span className="badge badge-unpaid"><DoorOpenFill /> {u.pending_room_name}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="actions-cell" style={{ justifyContent: 'center' }}>
                        <button className="btn btn-success" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => approve(u.id)} disabled={busy}>
                          <CheckCircleFill /> Duyệt
                        </button>
                        <button className="btn btn-danger" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => reject(u.id)} disabled={busy}>
                          <XCircleFill /> Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DANH SÁCH SINH VIÊN & BỘ LỌC */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="section-title mb-0"><PeopleFill className="text-primary" /> Danh sách Sinh viên ({filteredStudents.length}/{students.length})</h2>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Tìm tên, MSSV, CCCD, lớp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-input form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="approved">Đã có phòng</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Bị từ chối</option>
              <option value="none">Chưa đăng ký</option>
            </select>

            <select
              className="form-input form-select"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">Tất cả các phòng</option>
              <option value="unassigned">Chưa xếp phòng</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.room_name} ({r.current_occupancy || 0}/{r.capacity || 4})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Họ và tên</th>
                <th>MSSV</th>
                <th>CCCD</th>
                <th>Giới tính</th>
                <th>Lớp</th>
                <th>Email / SĐT</th>
                <th>Phòng</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {students.length === 0 ? 'Chưa có sinh viên nào trong hệ thống.' : 'Không tìm thấy sinh viên phù hợp với bộ lọc.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((u) => (
                  <tr key={u.id}>
                    <td><strong>#{u.id}</strong></td>
                    <td><strong>{u.full_name || <span className="text-muted">(Chưa cập nhật)</span>}</strong></td>
                    <td><code>{u.mssv || '—'}</code></td>
                    <td>{u.cccd || '—'}</td>
                    <td>{u.gender || 'Nam'}</td>
                    <td>{u.class_name || '—'}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{u.email}</div>
                      <div className="small text-muted">{u.phone || '—'}</div>
                    </td>
                    <td>
                      {u.room?.room_name ? (
                        <span className="fw-bold" style={{ color: 'var(--primary)' }}><DoorOpenFill /> {u.room.room_name}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>{statusBadge(u.room_status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="actions-cell" style={{ justifyContent: 'center' }}>
                        <button className="btn-icon" title="Chỉnh sửa thông tin" onClick={() => openEditModal(u)} disabled={busy}>
                          <PencilFill size={14} />
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Xóa sinh viên" onClick={() => remove(u.id, u.full_name || u.username)} disabled={busy}>
                          <TrashFill size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT / CREATE FORM */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {modalMode === 'create' ? <PersonPlusFill className="text-primary" /> : <PencilFill className="text-primary" />}
                {modalMode === 'create' ? 'Thêm Sinh Viên Mới' : `Chỉnh Sửa Sinh Viên #${selectedUser?.id}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <XLg size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitModal} style={{ padding: '1.5rem' }}>
              {modalMode === 'create' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group mb-0">
                    <label className="form-label">Tên đăng nhập <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: student01"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Mật khẩu khởi tạo</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Mặc định: 123456"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Họ và tên sinh viên <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: Nguyễn Văn A"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Mã sinh viên (MSSV)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: SV202601"
                    value={formData.mssv}
                    onChange={(e) => setFormData({ ...formData, mssv: e.target.value })}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Số CCCD / CMND</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: 011206003082"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Giới tính</label>
                  <select
                    className="form-input form-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@ktx.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0987654321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Lớp học</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: CNTT01"
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Quê quán</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: Hà Nội"
                    value={formData.hometown}
                    onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                  />
                </div>
              </div>

              {/* PHÂN PHÒNG & TRẠNG THÁI PHÒNG */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DoorOpenFill /> Xếp Phòng Ký Túc Xá & Trạng Thái
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group mb-0">
                    <label className="form-label">Chọn Phòng ở</label>
                    <select
                      className="form-input form-select"
                      value={formData.room_id}
                      onChange={(e) => {
                        const newRoomId = e.target.value;
                        setFormData({
                          ...formData,
                          room_id: newRoomId,
                          room_status: newRoomId ? 'approved' : 'none',
                        });
                      }}
                    >
                      <option value="">-- Chưa xếp phòng --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.room_name} (Đang ở: {r.current_occupancy || 0}/{r.capacity || 4})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">Trạng thái duyệt phòng</label>
                    <select
                      className="form-input form-select"
                      value={formData.room_status}
                      onChange={(e) => setFormData({ ...formData, room_status: e.target.value })}
                    >
                      <option value="approved">Đã có phòng (approved)</option>
                      <option value="pending">Chờ duyệt (pending)</option>
                      <option value="rejected">Bị từ chối (rejected)</option>
                      <option value="none">Chưa đăng ký (none)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: 'auto' }}
                  onClick={() => setIsModalOpen(false)}
                  disabled={busy}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: 'auto' }}
                  disabled={busy}
                >
                  {busy ? 'Đang lưu...' : <><Save2Fill /> {modalMode === 'create' ? 'Tạo Sinh Viên' : 'Lưu Thay Đổi'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsAdmin;
