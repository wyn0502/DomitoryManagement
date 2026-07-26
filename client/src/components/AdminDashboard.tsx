import React, { useState, useEffect, FormEvent } from 'react';
import RevenueChart from './RevenueChart';
import {
  ArrowRepeat, ExclamationTriangleFill, CheckCircleFill, CashStack, HourglassSplit,
  FileEarmarkTextFill, HouseDoorFill, LightningChargeFill, Save2Fill, PencilSquare,
  Lightbulb, FolderFill, PencilFill, CashCoin, TrashFill, DoorOpenFill,
} from 'react-bootstrap-icons';

interface Room {
  id: number;
  room_name: string;
  price?: number;
  fixed_rent?: number;
  capacity?: number;
  current_occupancy?: number;
  type?: string;
  students?: Array<{ id: number; full_name?: string }>;
}

interface UtilityMeter {
  electricity_old_index: number;
  electricity_new_index: number;
  water_old_index: number;
  water_new_index: number;
}

interface Invoice {
  id: number;
  room_id: number;
  month: number;
  year: number;
  room_price: number;
  electricity_amount: number;
  water_amount: number;
  total_amount: number;
  status: string;
  room?: { room_name: string };
  utilityMeter?: UtilityMeter;
}

interface DashboardStats {
  cards: { totalRevenue: number; totalUnpaid: number; invoiceCount: number; roomCount: number };
  monthlyRevenue: Array<{ label: string; value: number }>;
  statusRatio: Array<{ status: string; count: number }>;
}

interface EditingInvoiceState {
  id: number;
  room?: { room_name: string };
  month: number;
  year: number;
  electricity_index: number;
  water_index: number;
}

interface AdminDashboardProps {
  token: string;
  section: string; // 'overview' | 'invoices' | 'rooms'
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, section }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [createForm, setCreateForm] = useState({
    room_id: '',
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    electricity_index: '',
    water_index: '',
  });

  const [editingInvoice, setEditingInvoice] = useState<EditingInvoiceState | null>(null);

  // CRUD Phòng ở
  const emptyRoom = { room_name: '', type: 'Thường', capacity: '4', fixed_rent: '1500000' };
  const [roomForm, setRoomForm] = useState<{ room_name: string; type: string; capacity: string; fixed_rent: string }>(emptyRoom);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [invoicesRes, roomsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/invoices`, { headers }),
        fetch(`${API}/api/rooms`, { headers }),
        fetch(`${API}/api/dashboard/admin-stats`, { headers }),
      ]);

      if (!invoicesRes.ok || !roomsRes.ok || !statsRes.ok) {
        throw new Error('Không thể tải một hoặc nhiều tài nguyên từ hệ thống.');
      }

      setInvoices(await invoicesRes.json());
      setRooms(await roomsRes.json());
      setStats(await statsRes.json());
    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? 'Không kết nối được máy chủ (http://localhost:3000). Hãy kiểm tra Backend đang chạy.' : err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const handleCreateInvoice = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!createForm.room_id) {
      setError('Vui lòng chọn phòng ở');
      return;
    }
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/invoices/record-index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          room_id: parseInt(createForm.room_id, 10),
          month: parseInt(createForm.month, 10),
          year: parseInt(createForm.year, 10),
          electricity_index: parseFloat(createForm.electricity_index),
          water_index: parseFloat(createForm.water_index),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi nhập chỉ số điện nước.');

      setSuccess(`Đã ghi nhận chỉ số & tạo hóa đơn thành công cho phòng ${data.room?.room_name || ''}!`);
      setCreateForm({
        room_id: '',
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString(),
        electricity_index: '',
        water_index: '',
      });
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi tạo hóa đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateInvoice = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingInvoice) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/invoices/${editingInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          electricity_index: parseFloat(editingInvoice.electricity_index.toString()),
          water_index: parseFloat(editingInvoice.water_index.toString()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật chỉ số.');
      setSuccess('Cập nhật chỉ số hóa đơn thành công!');
      setEditingInvoice(null);
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi cập nhật hóa đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận thanh toán thủ công cho hóa đơn này không?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/invoices/${id}/confirm-payment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xác nhận thanh toán.');
      setSuccess('Đã chuyển trạng thái hóa đơn sang Đã thanh toán!');
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi xác nhận thanh toán');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!window.confirm('Cảnh báo! Xóa hóa đơn sẽ đồng thời xóa chỉ số điện nước liên quan. Bạn có chắc chắn muốn xóa không?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xóa hóa đơn.');
      setSuccess('Xóa hóa đơn thành công!');
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi xóa hóa đơn');
    } finally {
      setActionLoading(false);
    }
  };

  // ===== CRUD Phòng ở =====
  const handleSaveRoom = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        room_name: roomForm.room_name.trim(),
        type: roomForm.type.trim() || 'Thường',
        capacity: parseInt(roomForm.capacity, 10),
        fixed_rent: parseFloat(roomForm.fixed_rent),
      };
      const url = editingRoomId ? `${API}/api/rooms/${editingRoomId}` : `${API}/api/rooms`;
      const method = editingRoomId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi lưu phòng');
      setSuccess(editingRoomId ? 'Cập nhật phòng thành công!' : 'Thêm phòng mới thành công!');
      setRoomForm(emptyRoom);
      setEditingRoomId(null);
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu phòng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này không?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/rooms/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xóa phòng');
      setSuccess('Xóa phòng thành công!');
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi xóa phòng');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomForm({
      room_name: room.room_name || '',
      type: room.type || 'Thường',
      capacity: String(room.capacity ?? 4),
      fixed_rent: String(room.fixed_rent ?? room.price ?? 1500000),
    });
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' as const }}>
        <h2 className="d-flex align-items-center justify-content-center gap-2"><ArrowRepeat size={28} /> Đang tải dữ liệu...</h2>
      </div>
    );
  }

  const alerts = (
    <>
      {error && <div className="alert alert-danger"><ExclamationTriangleFill /> {error}</div>}
      {success && <div className="alert alert-success"><CheckCircleFill /> {success}</div>}
    </>
  );

  const refreshBtn = (
    <button className="btn btn-secondary" onClick={loadDashboardData} style={{ width: 'auto' }} disabled={actionLoading}>
      <ArrowRepeat size={18} /> Làm mới dữ liệu
    </button>
  );

  // ============ TRANG: TỔNG QUAN ============
  if (section === 'overview') {
    return (
      <div className="animate-fade-in">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p className="text-secondary mb-0">Chào mừng Admin, đây là tổng quan doanh thu và tình trạng hóa đơn của ký túc xá.</p>
          {refreshBtn}
        </div>

        {alerts}

        {stats && (
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-icon icon-revenue"><CashStack size={28} /></div>
              <div className="stat-info">
                <span className="stat-label">Tổng Doanh Thu</span>
                <span className="stat-value">{Number(stats.cards.totalRevenue || 0).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon icon-unpaid"><HourglassSplit size={26} /></div>
              <div className="stat-info">
                <span className="stat-label">Chưa Thanh Toán</span>
                <span className="stat-value">{Number(stats.cards.totalUnpaid || 0).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon icon-invoices"><FileEarmarkTextFill size={26} /></div>
              <div className="stat-info">
                <span className="stat-label">Tổng Hóa Đơn</span>
                <span className="stat-value">{stats.cards.invoiceCount || 0}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon icon-rooms"><HouseDoorFill size={26} /></div>
              <div className="stat-info">
                <span className="stat-label">Tổng Số Phòng</span>
                <span className="stat-value">{stats.cards.roomCount || 0}</span>
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div style={{ marginTop: '0.5rem' }}>
            <RevenueChart monthlyRevenue={stats.monthlyRevenue} statusRatio={stats.statusRatio} />
          </div>
        )}
      </div>
    );
  }

  // ============ TRANG: QUẢN LÝ HÓA ĐƠN ============
  if (section === 'invoices') {
    return (
      <div className="animate-fade-in">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>{refreshBtn}</div>
        {alerts}

        <div className="dashboard-layout" style={{ marginBottom: '2.5rem' }}>
          <div>
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
              <h2 className="section-title"><LightningChargeFill className="text-warning" /> Nhập Chỉ Số Điện Nước & Sinh Hóa Đơn</h2>
              <form onSubmit={handleCreateInvoice}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Chọn Phòng ký túc xá</label>
                    <select value={createForm.room_id} onChange={(e: any) => setCreateForm({ ...createForm, room_id: e.target.value })} className="form-input form-select" required>
                      <option value="">-- Chọn phòng --</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.room_name} ({Number(room.price || room.fixed_rent || 0).toLocaleString('vi-VN')} đ/tháng)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: 0 }}>
                    <div>
                      <label className="form-label">Tháng</label>
                      <input type="number" min="1" max="12" value={createForm.month} onChange={(e: any) => setCreateForm({ ...createForm, month: e.target.value })} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Năm</label>
                      <input type="number" min="2020" max="2030" value={createForm.year} onChange={(e: any) => setCreateForm({ ...createForm, year: e.target.value })} className="form-input" required />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Chỉ số Điện Mới (kWh)</label>
                    <input type="number" step="0.1" min="0" placeholder="Chỉ số điện mới..." value={createForm.electricity_index} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, electricity_index: e.target.value })} className="form-input" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Chỉ số Nước Mới (m³)</label>
                    <input type="number" step="0.1" min="0" placeholder="Chỉ số nước mới..." value={createForm.water_index} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, water_index: e.target.value })} className="form-input" required />
                  </div>
                </div>

                <button type="submit" className="btn btn-success" disabled={actionLoading}>
                  {actionLoading ? 'Đang tạo...' : <><Save2Fill /> Xác nhận chỉ số & Tạo hóa đơn</>}
                </button>
              </form>
            </div>

            {editingInvoice && (
              <div className="glass-panel" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
                <h2 className="section-title" style={{ color: 'var(--primary)' }}><PencilSquare /> Sửa Chỉ Số Hóa Đơn #{editingInvoice.id}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Phòng: <strong>{editingInvoice.room?.room_name}</strong> | Tháng: <strong>{editingInvoice.month}/{editingInvoice.year}</strong>
                </p>
                <form onSubmit={handleUpdateInvoice}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Chỉ số Điện Cập Nhật (kWh)</label>
                      <input type="number" step="0.1" min="0" value={editingInvoice.electricity_index} onChange={(e: any) => setEditingInvoice({ ...editingInvoice, electricity_index: parseFloat(e.target.value) || 0 })} className="form-input" required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Chỉ số Nước Cập Nhật (m³)</label>
                      <input type="number" step="0.1" min="0" value={editingInvoice.water_index} onChange={(e: any) => setEditingInvoice({ ...editingInvoice, water_index: parseFloat(e.target.value) || 0 })} className="form-input" required />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingInvoice(null)} disabled={actionLoading}>Hủy bỏ</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div>
            <div className="chart-container" style={{ height: '100%' }}>
              <h3 className="chart-title"><Lightbulb className="text-warning" /> Nguyên Tắc Tính Hóa Đơn</h3>
              <ul style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <li>Tiền điện: <strong>3.000đ</strong> / kWh tiêu thụ</li>
                <li>Tiền nước: <strong>15.000đ</strong> / m³ tiêu thụ</li>
                <li>Tiền phòng cố định: lấy theo cấu hình từng phòng</li>
                <li><strong>Tổng tiền</strong> = Phòng cố định + (Số điện × 3.000) + (Số nước × 15.000)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <h2 className="section-title"><FolderFill className="text-primary" /> Danh Sách Hóa Đơn Toàn Ký Túc Xá</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Phòng</th>
                  <th>Tháng/Năm</th>
                  <th>Điện Tiêu Thụ</th>
                  <th>Nước Tiêu Thụ</th>
                  <th>Tiền Phòng</th>
                  <th>Tiền Điện</th>
                  <th>Tiền Nước</th>
                  <th>Tổng Tiền</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((inv) => {
                    const elecConsumed = (inv.utilityMeter?.electricity_new_index || 0) - (inv.utilityMeter?.electricity_old_index || 0);
                    const waterConsumed = (inv.utilityMeter?.water_new_index || 0) - (inv.utilityMeter?.water_old_index || 0);
                    const isPaid = inv.status === 'paid';
                    return (
                      <tr key={inv.id}>
                        <td><strong>#{inv.id}</strong></td>
                        <td>{inv.room?.room_name || `ID ${inv.room_id}`}</td>
                        <td>{inv.month}/{inv.year}</td>
                        <td>
                          {elecConsumed.toFixed(1)} kWh<br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({inv.utilityMeter?.electricity_old_index || 0} → {inv.utilityMeter?.electricity_new_index || 0})</span>
                        </td>
                        <td>
                          {waterConsumed.toFixed(1)} m³<br />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({inv.utilityMeter?.water_old_index || 0} → {inv.utilityMeter?.water_new_index || 0})</span>
                        </td>
                        <td>{Number(inv.room_price || 0).toLocaleString('vi-VN')}đ</td>
                        <td>{Number(inv.electricity_amount || 0).toLocaleString('vi-VN')}đ</td>
                        <td>{Number(inv.water_amount || 0).toLocaleString('vi-VN')}đ</td>
                        <td><strong style={{ color: 'var(--primary)' }}>{Number(inv.total_amount || 0).toLocaleString('vi-VN')}đ</strong></td>
                        <td><span className={`badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}`}>{isPaid ? 'Đã đóng' : 'Chưa đóng'}</span></td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="actions-cell" style={{ justifyContent: 'center' }}>
                            <button title="Sửa chỉ số" onClick={() => setEditingInvoice({ id: inv.id, room: inv.room, month: inv.month, year: inv.year, electricity_index: inv.utilityMeter?.electricity_new_index || 0, water_index: inv.utilityMeter?.water_new_index || 0 })} className="btn-icon" disabled={actionLoading}>
                              <PencilFill size={14} />
                            </button>
                            {!isPaid && (
                              <button title="Xác nhận đóng tiền thủ công" onClick={() => handleConfirmPayment(inv.id)} className="btn-icon" style={{ color: 'var(--success)', borderColor: 'rgba(16,185,129,0.2)' }} disabled={actionLoading}>
                                <CashCoin size={14} />
                              </button>
                            )}
                            <button title="Xóa hóa đơn" onClick={() => handleDeleteInvoice(inv.id)} className="btn-icon btn-icon-danger" disabled={actionLoading}>
                              <TrashFill size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa ghi nhận hóa đơn nào trong cơ sở dữ liệu.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ============ TRANG: PHÒNG Ở (CRUD) ============
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>{refreshBtn}</div>
      {alerts}

      {/* Form Thêm / Sửa phòng */}
      <div className="glass-panel" style={{ marginBottom: '2rem', ...(editingRoomId ? { border: '1px solid var(--primary)' } : {}) }}>
        <h2 className="section-title">
          {editingRoomId ? <><PencilSquare style={{ color: 'var(--primary)' }} /> Sửa Phòng #{editingRoomId}</> : <><DoorOpenFill className="text-primary" /> Thêm Phòng Mới</>}
        </h2>
        <form onSubmit={handleSaveRoom}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tên phòng</label>
              <input className="form-input" placeholder="VD: Phòng C101" value={roomForm.room_name} onChange={(e) => setRoomForm({ ...roomForm, room_name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Loại phòng</label>
              <input className="form-input" placeholder="Thường / VIP..." value={roomForm.type} onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sức chứa</label>
              <input type="number" min="1" className="form-input" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tiền phòng (đ/tháng)</label>
              <input type="number" min="0" step="1000" className="form-input" value={roomForm.fixed_rent} onChange={(e) => setRoomForm({ ...roomForm, fixed_rent: e.target.value })} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-success" style={{ width: 'auto' }} disabled={actionLoading}>
              <Save2Fill /> {editingRoomId ? 'Lưu thay đổi' : 'Thêm phòng'}
            </button>
            {editingRoomId && (
              <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => { setEditingRoomId(null); setRoomForm(emptyRoom); }} disabled={actionLoading}>Hủy</button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-panel">
        <h2 className="section-title"><DoorOpenFill className="text-primary" /> Danh Sách Phòng Ký Túc Xá</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên Phòng</th>
                <th>Loại Phòng</th>
                <th>Sức Chứa</th>
                <th>Đang Ở</th>
                <th>Tiền Phòng / Tháng</th>
                <th style={{ textAlign: 'center' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length > 0 ? (
                rooms.map((room) => {
                  const occ = room.current_occupancy ?? (room.students?.length || 0);
                  const cap = room.capacity ?? 0;
                  const full = cap > 0 && occ >= cap;
                  return (
                    <tr key={room.id}>
                      <td><strong>#{room.id}</strong></td>
                      <td className="d-flex align-items-center gap-2"><HouseDoorFill className="text-primary" /> {room.room_name}</td>
                      <td>{room.type || 'Thường'}</td>
                      <td>{cap} người</td>
                      <td><span className={`badge ${full ? 'badge-unpaid' : 'badge-paid'}`}>{occ}/{cap} {full ? 'Đầy' : 'Còn chỗ'}</span></td>
                      <td><strong style={{ color: 'var(--primary)' }}>{Number(room.fixed_rent || room.price || 0).toLocaleString('vi-VN')}đ</strong></td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="actions-cell" style={{ justifyContent: 'center' }}>
                          <button title="Sửa phòng" className="btn-icon" onClick={() => startEditRoom(room)} disabled={actionLoading}><PencilFill size={14} /></button>
                          <button title="Xóa phòng" className="btn-icon btn-icon-danger" onClick={() => handleDeleteRoom(room.id)} disabled={actionLoading}><TrashFill size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có phòng nào trong hệ thống.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
