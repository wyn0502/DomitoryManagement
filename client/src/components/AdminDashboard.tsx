import React, { useState, useEffect, FormEvent } from 'react';
import RevenueChart from './RevenueChart';
import {
  ArrowRepeat, ExclamationTriangleFill, CheckCircleFill, CashStack, HourglassSplit,
  FileEarmarkTextFill, HouseDoorFill, LightningChargeFill, Save2Fill, PencilSquare,
  Lightbulb, FolderFill, PencilFill, CashCoin, TrashFill, DoorOpenFill, Search,
  Sliders, PlusCircleFill, BuildingFill, XLg, PeopleFill,
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
  id?: number;
  electricity_old_index: number;
  electricity_new_index: number;
  water_old_index: number;
  water_new_index: number;
}

interface UserLite {
  id: number;
  full_name: string;
  mssv: string;
  cccd: string;
  gender: string;
  email: string;
  phone: string;
  class_name?: string;
  hometown?: string;
}

interface Invoice {
  id: number;
  room_id: number;
  user_id?: number | null;
  month: number;
  year: number;
  service_type: string;
  service_name: string;
  content?: string;
  room_price: number;
  electricity_amount: number;
  water_amount: number;
  total_amount: number;
  status: string;
  due_date?: string;
  paid_at?: string;
  created_at?: string;
  room?: Room;
  user?: UserLite;
  utilityMeter?: UtilityMeter;
}

interface DashboardStats {
  cards: { totalRevenue: number; totalUnpaid: number; invoiceCount: number; roomCount: number };
  monthlyRevenue: Array<{ label: string; value: number }>;
  statusRatio: Array<{ status: string; count: number }>;
}

interface EditingInvoiceState {
  id: number;
  service_name: string;
  content: string;
  total_amount: number;
  status: string;
  due_date: string;
  user_name?: string;
  room_name?: string;
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

  // Đơn giá điện nước
  const [utilityPrices, setUtilityPrices] = useState({ electricPrice: 3000, waterPrice: 15000 });
  const [editingPrices, setEditingPrices] = useState({ electricPrice: '3000', waterPrice: '15000' });
  const [isPriceFormOpen, setIsPriceFormOpen] = useState(false);

  // Form nhập chỉ số điện nước
  const [createForm, setCreateForm] = useState({
    room_id: '',
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    electricity_index: '',
    water_index: '',
  });

  // Form tạo hóa đơn tiền phòng
  const [roomFeeForm, setRoomFeeForm] = useState({
    room_id: '',
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
  });

  // Search & Filter cho danh sách Hóa Đơn
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoiceRoomFilter, setInvoiceRoomFilter] = useState('all');

  // Modal Xem Danh Sách Sinh Viên Trong Phòng
  const [viewingRoomStudents, setViewingRoomStudents] = useState<Room | null>(null);
  const [roomStudentsList, setRoomStudentsList] = useState<UserLite[]>([]);
  const [fetchingRoomStudents, setFetchingRoomStudents] = useState(false);

  // Modal Sửa Hóa Đơn Chi Tiết
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
      const [invoicesRes, roomsRes, statsRes, pricesRes] = await Promise.all([
        fetch(`${API}/api/invoices`, { headers }),
        fetch(`${API}/api/rooms`, { headers }),
        fetch(`${API}/api/dashboard/admin-stats`, { headers }),
        fetch(`${API}/api/invoices/utility-prices`, { headers }),
      ]);

      if (!invoicesRes.ok || !roomsRes.ok || !statsRes.ok) {
        throw new Error('Không thể tải dữ liệu từ máy chủ.');
      }

      const invData = await invoicesRes.json();
      const rmData = await roomsRes.json();
      const stData = await statsRes.json();
      setInvoices(invData);
      setRooms(rmData);
      setStats(stData);

      if (pricesRes.ok) {
        const prData = await pricesRes.json();
        setUtilityPrices(prData);
        setEditingPrices({ electricPrice: String(prData.electricPrice), waterPrice: String(prData.waterPrice) });
      }
    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? 'Không kết nối được máy chủ (http://localhost:3000).' : err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Xem danh sách sinh viên đang ở trong một phòng cụ thể
  const handleViewRoomStudents = async (room: Room) => {
    setViewingRoomStudents(room);
    setFetchingRoomStudents(true);
    try {
      const res = await fetch(`${API}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const allUsers = await res.json();
        const inRoom = allUsers.filter((u: any) => u.room_id === room.id && u.room_status === 'approved');
        setRoomStudentsList(inRoom);
      }
    } catch (e) {
      console.error('Lỗi lấy danh sách sinh viên phòng:', e);
    } finally {
      setFetchingRoomStudents(false);
    }
  };

  // Cập nhật đơn giá điện nước
  const handleSavePrices = async (e: FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/invoices/utility-prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          electricPrice: parseFloat(editingPrices.electricPrice),
          waterPrice: parseFloat(editingPrices.waterPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Không cập nhật được đơn giá điện nước');
      setUtilityPrices(data);
      setSuccess(`Cập nhật đơn giá thành công! Điện: ${data.electricPrice.toLocaleString('vi-VN')}đ/kWh, Nước: ${data.waterPrice.toLocaleString('vi-VN')}đ/m³`);
      setIsPriceFormOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Tạo hóa đơn điện nước (Chia đều thành viên)
  const handleCreateInvoice = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!createForm.room_id) {
      setError('Vui lòng chọn phòng ký túc xá');
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

      const count = Array.isArray(data) ? data.length : 1;
      setSuccess(`Đã ghi nhận chỉ số & tự động chia đều tạo ${count} hóa đơn điện nước cho từng sinh viên trong phòng!`);
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

  // Tạo hóa đơn tiền phòng riêng
  const handleCreateRoomFeeInvoices = async (e: FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/invoices/create-room-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          room_id: roomFeeForm.room_id ? parseInt(roomFeeForm.room_id, 10) : undefined,
          month: parseInt(roomFeeForm.month, 10),
          year: parseInt(roomFeeForm.year, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tạo hóa đơn tiền phòng');
      const count = Array.isArray(data) ? data.length : 0;
      setSuccess(`Tạo thành công ${count} hóa đơn Tiền Phòng riêng biệt cho sinh viên!`);
      loadDashboardData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Cập nhật chi tiết hóa đơn
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
          service_name: editingInvoice.service_name,
          content: editingInvoice.content,
          total_amount: editingInvoice.total_amount,
          status: editingInvoice.status,
          due_date: editingInvoice.due_date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật hóa đơn.');
      setSuccess('Cập nhật thông tin hóa đơn thành công!');
      setEditingInvoice(null);
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi cập nhật hóa đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async (id: number) => {
    if (!window.confirm('Xác nhận đánh dấu sinh viên đã thanh toán trực tiếp cho hóa đơn này?')) return;
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
      setSuccess('Đã chuyển trạng thái hóa đơn sang ĐÃ THANH TOÁN!');
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi xác nhận thanh toán');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!window.confirm('Cảnh báo! Bạn có chắc chắn muốn xóa hóa đơn này khỏi hệ thống?')) return;
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

  // CRUD Phòng
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
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

  // ============ TRANG: QUẢN LÝ HÓA ĐƠN (Phenikaa KTX Style) ============
  if (section === 'invoices') {
    const filteredInvoices = invoices.filter((inv) => {
      const q = invoiceSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (inv.user?.full_name && inv.user.full_name.toLowerCase().includes(q)) ||
        (inv.user?.mssv && inv.user.mssv.toLowerCase().includes(q)) ||
        (inv.user?.cccd && inv.user.cccd.toLowerCase().includes(q)) ||
        (inv.user?.email && inv.user.email.toLowerCase().includes(q)) ||
        (inv.user?.phone && inv.user.phone.toLowerCase().includes(q)) ||
        (inv.room?.room_name && inv.room.room_name.toLowerCase().includes(q)) ||
        (inv.service_type && inv.service_type.toLowerCase().includes(q)) ||
        (inv.service_name && inv.service_name.toLowerCase().includes(q)) ||
        (inv.content && inv.content.toLowerCase().includes(q)) ||
        (inv.status && inv.status.toLowerCase().includes(q)) ||
        (`${inv.month}/${inv.year}`.includes(q));

      const matchesService = serviceTypeFilter === 'all' || inv.service_type === serviceTypeFilter;
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchesRoom = invoiceRoomFilter === 'all' || String(inv.room_id) === invoiceRoomFilter;

      return matchesSearch && matchesService && matchesStatus && matchesRoom;
    });

    return (
      <div className="animate-fade-in">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={() => setIsPriceFormOpen(!isPriceFormOpen)} style={{ width: 'auto' }}>
              <Sliders size={18} /> Chỉnh sửa đơn giá Điện/Nước
            </button>
          </div>
          {refreshBtn}
        </div>

        {alerts}

        {/* Form Chỉnh Sửa Đơn Giá Điện Nước */}
        {isPriceFormOpen && (
          <div className="glass-panel" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
            <h2 className="section-title" style={{ color: 'var(--primary)' }}><Sliders /> Cấu Hình Đơn Giá Điện & Nước</h2>
            <form onSubmit={handleSavePrices}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Đơn giá Điện (VNĐ / kWh)</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    className="form-input"
                    value={editingPrices.electricPrice}
                    onChange={(e) => setEditingPrices({ ...editingPrices, electricPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Đơn giá Nước (VNĐ / m³)</label>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    className="form-input"
                    value={editingPrices.waterPrice}
                    onChange={(e) => setEditingPrices({ ...editingPrices, waterPrice: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={actionLoading}>
                  <Save2Fill /> Lưu đơn giá mới
                </button>
                <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setIsPriceFormOpen(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="dashboard-layout" style={{ marginBottom: '2rem' }}>
          {/* Nhập Chỉ Số Điện Nước & Sinh Hóa Đơn */}
          <div className="glass-panel">
            <h2 className="section-title"><LightningChargeFill className="text-warning" /> Nhập Chỉ Số Điện Nước (Chia Đều Phòng)</h2>
            <form onSubmit={handleCreateInvoice}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Chọn Phòng ký túc xá</label>
                  <select
                    value={createForm.room_id}
                    onChange={(e: any) => setCreateForm({ ...createForm, room_id: e.target.value })}
                    className="form-input form-select"
                    required
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.room_name} ({room.current_occupancy || 0}/{room.capacity || 4} SV)
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group mb-0">
                    <label className="form-label">Tháng</label>
                    <input type="number" min="1" max="12" value={createForm.month} onChange={(e: any) => setCreateForm({ ...createForm, month: e.target.value })} className="form-input" required />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Năm</label>
                    <input type="number" min="2020" max="2030" value={createForm.year} onChange={(e: any) => setCreateForm({ ...createForm, year: e.target.value })} className="form-input" required />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Chỉ số Điện Mới (kWh)</label>
                  <input type="number" step="0.1" min="0" placeholder="Số điện mới..." value={createForm.electricity_index} onChange={(e: any) => setCreateForm({ ...createForm, electricity_index: e.target.value })} className="form-input" required />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Chỉ số Nước Mới (m³)</label>
                  <input type="number" step="0.1" min="0" placeholder="Số nước mới..." value={createForm.water_index} onChange={(e: any) => setCreateForm({ ...createForm, water_index: e.target.value })} className="form-input" required />
                </div>
              </div>

              <button type="submit" className="btn btn-success" disabled={actionLoading}>
                {actionLoading ? 'Đang tạo...' : <><Save2Fill /> Tạo Hóa Đơn Điện Nước Chia Đều</>}
              </button>
            </form>
          </div>

          {/* Tạo Hóa Đơn Tiền Phòng & Thông tin Đơn Giá */}
          <div>
            <div className="glass-panel mb-3">
              <h3 className="section-title" style={{ fontSize: '1.1rem' }}><BuildingFill className="text-primary" /> Tạo Hóa Đơn Tiền Phòng Riêng</h3>
              <form onSubmit={handleCreateRoomFeeInvoices}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <select className="form-input form-select" value={roomFeeForm.room_id} onChange={(e) => setRoomFeeForm({ ...roomFeeForm, room_id: e.target.value })}>
                    <option value="">-- Tất cả các phòng --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.room_name}</option>
                    ))}
                  </select>
                  <input type="number" min="1" max="12" className="form-input" placeholder="Tháng" value={roomFeeForm.month} onChange={(e) => setRoomFeeForm({ ...roomFeeForm, month: e.target.value })} required />
                  <input type="number" min="2020" max="2030" className="form-input" placeholder="Năm" value={roomFeeForm.year} onChange={(e) => setRoomFeeForm({ ...roomFeeForm, year: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  <PlusCircleFill /> Phát Hành Hóa Đơn Tiền Phòng
                </button>
              </form>
            </div>

            <div className="chart-container">
              <h3 className="chart-title"><Lightbulb className="text-warning" /> Đơn Giá Hiện Tại</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Tiền điện: <strong style={{ color: 'var(--primary)' }}>{utilityPrices.electricPrice.toLocaleString('vi-VN')}đ</strong> / kWh</li>
                <li>Tiền nước: <strong style={{ color: 'var(--primary)' }}>{utilityPrices.waterPrice.toLocaleString('vi-VN')}đ</strong> / m³</li>
                <li>Tiền điện nước sau khi tính sẽ <strong>chia đều cho từng sinh viên trong phòng</strong>.</li>
                <li>Hóa đơn tiền phòng phát hành riêng theo đơn giá từng loại phòng.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* MODAL SỬA HÓA ĐƠN CHI TIẾT */}
        {editingInvoice && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '16px', maxWidth: '600px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}><PencilSquare className="text-primary" /> Sửa Hóa Đơn #{editingInvoice.id}</h3>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setEditingInvoice(null)}><XLg size={18} /></button>
              </div>

              <form onSubmit={handleUpdateInvoice}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Tên dịch vụ</label>
                  <input className="form-input" value={editingInvoice.service_name} onChange={(e) => setEditingInvoice({ ...editingInvoice, service_name: e.target.value })} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Nội dung / Ghi chú</label>
                  <textarea className="form-input" rows={2} value={editingInvoice.content} onChange={(e) => setEditingInvoice({ ...editingInvoice, content: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">Số tiền (VNĐ)</label>
                    <input type="number" step="1000" className="form-input" value={editingInvoice.total_amount} onChange={(e) => setEditingInvoice({ ...editingInvoice, total_amount: parseFloat(e.target.value) || 0 })} required />
                  </div>
                  <div>
                    <label className="form-label">Trạng thái</label>
                    <select className="form-input form-select" value={editingInvoice.status} onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value })}>
                      <option value="unpaid">Chưa thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Hạn thanh toán</label>
                  <input type="date" className="form-input" value={editingInvoice.due_date ? editingInvoice.due_date.substring(0, 10) : ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, due_date: e.target.value })} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setEditingInvoice(null)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={actionLoading}>Lưu Thay Đổi</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DANH SÁCH HÓA ĐƠN CHUẨN PHENIKAA KTX (ẢNH 3) */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="section-title mb-0"><FolderFill className="text-primary" /> Chi Tiết Hóa Đơn Thanh Toán ({filteredInvoices.length})</h2>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tìm tên, MSSV, CCCD, phòng, tên HĐ..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  style={{ paddingLeft: '2.2rem' }}
                />
                <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <select className="form-input form-select" value={invoiceRoomFilter} onChange={(e) => setInvoiceRoomFilter(e.target.value)} style={{ width: 'auto' }}>
                <option value="all">Tất cả các phòng</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_name}
                  </option>
                ))}
              </select>

              <select className="form-input form-select" value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value)} style={{ width: 'auto' }}>
                <option value="all">Tất cả dịch vụ</option>
                <option value="Điện nước">Điện nước</option>
                <option value="Phòng">Phòng</option>
              </select>

              <select className="form-input form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="unpaid">Chưa thanh toán</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>STT</th>
                  <th>Họ và tên</th>
                  <th>Mã sinh viên</th>
                  <th>CCCD</th>
                  <th>Giới tính</th>
                  <th>Hạng phòng</th>
                  <th>Số phòng</th>
                  <th>Loại dịch vụ</th>
                  <th>Tên dịch vụ</th>
                  <th>Nội dung</th>
                  <th>Số tiền</th>
                  <th>Ngày phát sinh</th>
                  <th>Hạn thanh toán</th>
                  <th>Trạng Thái</th>
                  <th>Ngày thanh toán</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv, index) => {
                    const isPaid = inv.status === 'paid';
                    return (
                      <tr key={inv.id}>
                        <td><strong>{index + 1}</strong></td>
                        <td><strong>{inv.user?.full_name || 'Phòng ' + (inv.room?.room_name || '')}</strong></td>
                        <td><code>{inv.user?.mssv || '—'}</code></td>
                        <td>{inv.user?.cccd || '—'}</td>
                        <td>{inv.user?.gender || 'Nam'}</td>
                        <td>{inv.room?.type || 'Thường'}</td>
                        <td><span className="fw-bold" style={{ color: 'var(--primary)' }}>{inv.room?.room_name || `ID ${inv.room_id}`}</span></td>
                        <td>
                          <span className={`badge ${inv.service_type === 'Phòng' ? 'badge-paid' : 'badge-unpaid'}`} style={{ fontSize: '0.75rem' }}>
                            {inv.service_type || 'Điện nước'}
                          </span>
                        </td>
                        <td><strong>{inv.service_name || `Tiền ${inv.service_type} tháng ${inv.month}/${inv.year}`}</strong></td>
                        <td className="text-muted" style={{ maxWidth: '180px', fontSize: '0.8rem' }}>{inv.content || '—'}</td>
                        <td><strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{Number(inv.total_amount || 0).toLocaleString('vi-VN')}đ</strong></td>
                        <td>{formatDate(inv.created_at)}</td>
                        <td>{formatDate(inv.due_date)}</td>
                        <td>
                          <span className={`badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                            {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </span>
                        </td>
                        <td>{formatDate(inv.paid_at)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="actions-cell" style={{ justifyContent: 'center' }}>
                            <button
                              title="Sửa hóa đơn"
                              onClick={() => setEditingInvoice({
                                id: inv.id,
                                service_name: inv.service_name || '',
                                content: inv.content || '',
                                total_amount: inv.total_amount,
                                status: inv.status,
                                due_date: inv.due_date || '',
                                user_name: inv.user?.full_name,
                                room_name: inv.room?.room_name,
                              })}
                              className="btn-icon"
                              disabled={actionLoading}
                            >
                              <PencilFill size={13} />
                            </button>
                            {!isPaid && (
                              <button
                                title="Xác nhận thanh toán thủ công"
                                onClick={() => handleConfirmPayment(inv.id)}
                                className="btn-icon"
                                style={{ color: 'var(--success)', borderColor: 'rgba(16,185,129,0.3)' }}
                                disabled={actionLoading}
                              >
                                <CashCoin size={13} />
                              </button>
                            )}
                            <button title="Xóa hóa đơn" onClick={() => handleDeleteInvoice(inv.id)} className="btn-icon btn-icon-danger" disabled={actionLoading}>
                              <TrashFill size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={16} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Không có hóa đơn nào khớp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ============ TRANG: PHÒNG Ở (CRUD) & XEM SINH VIÊN TRONG PHÒNG ============
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>{refreshBtn}</div>
      {alerts}

      {/* MODAL XEM SINH VIÊN ĐANG Ở TRONG PHÒNG */}
      {viewingRoomStudents && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '16px', maxWidth: '800px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <PeopleFill /> Danh sách sinh viên — {viewingRoomStudents.room_name} ({roomStudentsList.length}/{viewingRoomStudents.capacity || 4} SV)
              </h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setViewingRoomStudents(null)}>
                <XLg size={20} />
              </button>
            </div>

            {fetchingRoomStudents ? (
              <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                <ArrowRepeat size={24} className="spin" /> Đang tải danh sách sinh viên...
              </div>
            ) : roomStudentsList.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Phòng này hiện tại chưa có sinh viên nào cư trú (trống).
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table" style={{ fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Họ và tên</th>
                      <th>MSSV</th>
                      <th>CCCD</th>
                      <th>Giới tính</th>
                      <th>Lớp</th>
                      <th>Số điện thoại</th>
                      <th>Email</th>
                      <th>Quê quán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomStudentsList.map((std, index) => (
                      <tr key={std.id}>
                        <td><strong>#{index + 1}</strong></td>
                        <td><strong>{std.full_name}</strong></td>
                        <td><code>{std.mssv || '—'}</code></td>
                        <td>{std.cccd || '—'}</td>
                        <td>{std.gender || 'Nam'}</td>
                        <td>{std.class_name || '—'}</td>
                        <td>{std.phone || '—'}</td>
                        <td className="small text-muted">{std.email}</td>
                        <td>{std.hometown || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setViewingRoomStudents(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
                      <td><HouseDoorFill className="text-primary" style={{ marginRight: '6px' }} /> {room.room_name}</td>
                      <td>{room.type || 'Thường'}</td>
                      <td>{cap} người</td>
                      <td><span className={`badge ${full ? 'badge-unpaid' : 'badge-paid'}`}>{occ}/{cap} {full ? 'Đầy' : 'Còn chỗ'}</span></td>
                      <td><strong style={{ color: 'var(--primary)' }}>{Number(room.fixed_rent || room.price || 0).toLocaleString('vi-VN')}đ</strong></td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="actions-cell" style={{ justifyContent: 'center' }}>
                          <button
                            title="Xem danh sách sinh viên trong phòng"
                            className="btn-icon"
                            style={{ color: 'var(--primary)', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                            onClick={() => handleViewRoomStudents(room)}
                            disabled={actionLoading}
                          >
                            <PeopleFill size={14} />
                          </button>
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
