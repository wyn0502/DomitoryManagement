import React, { useState, useEffect, FormEvent } from 'react';

interface Room {
  id: number;
  room_name: string;
  price: number;
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
  room?: {
    room_name: string;
  };
  utilityMeter?: UtilityMeter;
}

interface DashboardStats {
  cards: {
    totalRevenue: number;
    totalUnpaid: number;
    invoiceCount: number;
    roomCount: number;
  };
  monthlyRevenue: Array<{
    label: string;
    value: number;
  }>;
  statusRatio: Array<{
    status: string;
    count: number;
  }>;
}

interface EditingInvoiceState {
  id: number;
  room?: {
    room_name: string;
  };
  month: number;
  year: number;
  electricity_index: number;
  water_index: number;
}

interface AdminDashboardProps {
  token: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Create invoice form state
  const [createForm, setCreateForm] = useState({
    room_id: '',
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    electricity_index: '',
    water_index: '',
  });

  // Edit invoice state
  const [editingInvoice, setEditingInvoice] = useState<EditingInvoiceState | null>(null);

  // Fetch all necessary data
  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [invoicesRes, roomsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/api/invoices', { headers }),
        fetch('http://localhost:3000/api/rooms', { headers }),
        fetch('http://localhost:3000/api/dashboard/admin-stats', { headers }),
      ]);

      if (!invoicesRes.ok || !roomsRes.ok || !statsRes.ok) {
        throw new Error('Không thể tải một hoặc nhiều tài nguyên từ hệ thống.');
      }

      const invoicesData = await invoicesRes.json();
      const roomsData = await roomsRes.json();
      const statsData = await statsRes.json();

      setInvoices(invoicesData);
      setRooms(roomsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Handle create submit
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
      const res = await fetch('http://localhost:3000/api/invoices/record-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: parseInt(createForm.room_id, 10),
          month: parseInt(createForm.month, 10),
          year: parseInt(createForm.year, 10),
          electricity_index: parseFloat(createForm.electricity_index),
          water_index: parseFloat(createForm.water_index),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi nhập chỉ số điện nước.');
      }

      setSuccess(`Đã ghi nhận chỉ số & tạo hóa đơn thành công cho phòng ${data.room?.room_name || ''}!`);
      setCreateForm({
        room_id: '',
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString(),
        electricity_index: '',
        water_index: '',
      });
      loadDashboardData(); // Refresh list & stats
    } catch (err: any) {
      setError(err.message || 'Lỗi tạo hóa đơn');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle update submit
  const handleUpdateInvoice = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingInvoice) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${editingInvoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          electricity_index: parseFloat(editingInvoice.electricity_index.toString()),
          water_index: parseFloat(editingInvoice.water_index.toString()),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi cập nhật chỉ số.');
      }

      setSuccess('Cập nhật chỉ số hóa đơn thành công!');
      setEditingInvoice(null);
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi cập nhật hóa đơn');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle manual confirm payment
  const handleConfirmPayment = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận thanh toán thủ công cho hóa đơn này không?')) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}/confirm-payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi xác nhận thanh toán.');
      }

      setSuccess('Đã chuyển trạng thái hóa đơn sang Đã thanh toán!');
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi xác nhận thanh toán');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDeleteInvoice = async (id: number) => {
    if (!window.confirm('Cảnh báo! Xóa hóa đơn sẽ đồng thời xóa chỉ số điện nước liên quan. Bạn có chắc chắn muốn xóa không?')) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi xóa hóa đơn.');
      }

      setSuccess('Xóa hóa đơn thành công!');
      loadDashboardData();
    } catch (err: any) {
      setError(err.message || 'Lỗi xóa hóa đơn');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate maximum monthly revenue value to compute CSS bar widths dynamically
  const maxRevenueVal = stats?.monthlyRevenue?.length 
    ? Math.max(...stats.monthlyRevenue.map(item => item.value), 1) 
    : 1;

  if (loading && !stats) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}><h2>🚀 Đang tải dữ liệu dashboard...</h2></div>;
  }

  return (
    <div className="main-content" style={{ animation: 'slideIn 0.4s ease-out' }}>
      
      {/* 1. Header & Alerts */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Bảng Quản Trị Ký Túc Xá</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Chào mừng Quỳnh (Admin), quản lý phòng ở, chỉ số điện nước và hóa đơn.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadDashboardData} style={{ width: 'auto' }} disabled={actionLoading}>
          🔄 Làm mới dữ liệu
        </button>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* 2. Statistical Cards */}
      {stats && (
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon icon-revenue">💰</div>
            <div className="stat-info">
              <span className="stat-label">Tổng Doanh Thu</span>
              <span className="stat-value">{Number(stats.cards.totalRevenue || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-unpaid">⏳</div>
            <div className="stat-info">
              <span className="stat-label">Chưa Thanh Toán</span>
              <span className="stat-value">{Number(stats.cards.totalUnpaid || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-invoices">📄</div>
            <div className="stat-info">
              <span className="stat-label">Tổng Hóa Đơn</span>
              <span className="stat-value">{stats.cards.invoiceCount || 0}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-rooms">🏠</div>
            <div className="stat-info">
              <span className="stat-label">Tổng Số Phòng</span>
              <span className="stat-value">{stats.cards.roomCount || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Split Layout */}
      <div className="dashboard-layout">
        
        {/* Left Side: Create / Edit Form + Charts */}
        <div>
          {/* Create Billing Section */}
          <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">⚡ Nhập Chỉ Số Điện Nước & Sinh Hóa Đơn</h2>
            <form onSubmit={handleCreateInvoice}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Chọn Phòng ký túc xá</label>
                  <select
                    value={createForm.room_id}
                    onChange={(e) => setCreateForm({ ...createForm, room_id: e.target.value })}
                    className="form-input form-select"
                    required
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.room_name} ({Number(room.price).toLocaleString('vi-VN')} đ/tháng)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: 0 }}>
                  <div>
                    <label className="form-label">Tháng</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={createForm.month}
                      onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Năm</label>
                    <input
                      type="number"
                      min="2020"
                      max="2030"
                      value={createForm.year}
                      onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Chỉ số Điện Mới (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Chỉ số điện mới..."
                    value={createForm.electricity_index}
                    onChange={(e) => setCreateForm({ ...createForm, electricity_index: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Chỉ số Nước Mới (m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Chỉ số nước mới..."
                    value={createForm.water_index}
                    onChange={(e) => setCreateForm({ ...createForm, water_index: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success" disabled={actionLoading}>
                {actionLoading ? 'Đang tạo...' : '💾 Xác nhận chỉ số & Tạo hóa đơn'}
              </button>
            </form>
          </div>

          {/* Edit Invoice Section (Conditionally Rendered) */}
          {editingInvoice && (
            <div className="glass-panel" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
              <h2 className="section-title" style={{ color: 'var(--primary)' }}>✏️ Sửa Chỉ Số Hóa Đơn #{editingInvoice.id}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Phòng: <strong>{editingInvoice.room?.room_name}</strong> | Tháng: <strong>{editingInvoice.month}/{editingInvoice.year}</strong>
              </p>
              <form onSubmit={handleUpdateInvoice}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Chỉ số Điện Cập Nhật (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editingInvoice.electricity_index}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, electricity_index: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Chỉ số Nước Cập Nhật (m³)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editingInvoice.water_index}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, water_index: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingInvoice(null)} disabled={actionLoading}>
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Chart Section */}
          {stats && (
            <div className="chart-container">
              <h3 className="chart-title">📊 Doanh Thu Thực Tế Theo Tháng (CSS-Rendered Chart)</h3>
              <div className="bar-chart">
                {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                  stats.monthlyRevenue.map((item, idx) => {
                    const widthPercent = (item.value / maxRevenueVal) * 100;
                    return (
                      <div key={idx} className="bar-row">
                        <div className="bar-label">{item.label}</div>
                        <div className="bar-outer">
                          <div className="bar-inner" style={{ width: `${Math.max(widthPercent, 5)}%` }}>
                            {item.value > 0 && (
                              <span className="bar-value">{Number(item.value).toLocaleString('vi-VN')} đ</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Không có số liệu doanh thu thực tế.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Status Ratio Breakdown & Side stats */}
        <div>
          {stats && (
            <div className="chart-container" style={{ height: '100%' }}>
              <h3 className="chart-title">📈 Tỉ Lệ Hóa Đơn Theo Trạng Thái</h3>
              <div className="ratio-list">
                {stats.statusRatio && stats.statusRatio.length > 0 ? (
                  stats.statusRatio.map((item, idx) => {
                    const isPaid = item.status === 'Đã thanh toán';
                    return (
                      <div key={idx} className="ratio-item">
                        <div className="ratio-label">
                          <span 
                            className="ratio-dot" 
                            style={{ backgroundColor: isPaid ? 'var(--success)' : 'var(--danger)' }}
                          />
                          <span>{item.status}</span>
                        </div>
                        <span className="ratio-count">{item.count} hóa đơn</span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Không có dữ liệu.</div>
                )}
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--border-radius-md)', border: '1px dashed var(--border-glass)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>💡 Nguyên tắc tính giá:</h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <li>Điện: 3.000đ/kWh</li>
                  <li>Nước: 15.000đ/m³</li>
                  <li>Phòng cố định: Lấy theo cấu hình phòng</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Large Table: All Invoices */}
      <div className="glass-panel" style={{ marginTop: '2.5rem' }}>
        <h2 className="section-title">📂 Danh Sách Hóa Đơn Toàn Ký Túc Xá</h2>
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
                        {elecConsumed.toFixed(1)} kWh<br/>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ({inv.utilityMeter?.electricity_old_index || 0} → {inv.utilityMeter?.electricity_new_index || 0})
                        </span>
                      </td>
                      <td>
                        {waterConsumed.toFixed(1)} m³<br/>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ({inv.utilityMeter?.water_old_index || 0} → {inv.utilityMeter?.water_new_index || 0})
                        </span>
                      </td>
                      <td>{Number(inv.room_price || 0).toLocaleString('vi-VN')}đ</td>
                      <td>{Number(inv.electricity_amount || 0).toLocaleString('vi-VN')}đ</td>
                      <td>{Number(inv.water_amount || 0).toLocaleString('vi-VN')}đ</td>
                      <td><strong style={{ color: 'var(--primary)' }}>{Number(inv.total_amount || 0).toLocaleString('vi-VN')}đ</strong></td>
                      <td>
                        <span className={`badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                          {isPaid ? 'Đã đóng' : 'Chưa đóng'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="actions-cell" style={{ justifyContent: 'center' }}>
                          
                          {/* Sửa hóa đơn */}
                          <button
                            title="Sửa chỉ số"
                            onClick={() => setEditingInvoice({
                              id: inv.id,
                              room: inv.room,
                              month: inv.month,
                              year: inv.year,
                              electricity_index: inv.utilityMeter?.electricity_new_index || 0,
                              water_index: inv.utilityMeter?.water_new_index || 0,
                            })}
                            className="btn-icon"
                            disabled={actionLoading}
                          >
                            ✏️
                          </button>

                          {/* Xác nhận đóng tiền thủ công */}
                          {!isPaid && (
                            <button
                              title="Xác nhận đóng tiền thủ công"
                              onClick={() => handleConfirmPayment(inv.id)}
                              className="btn-icon"
                              style={{ color: 'var(--success)', borderColor: 'rgba(16,185,129,0.2)' }}
                              disabled={actionLoading}
                            >
                              💵
                            </button>
                          )}

                          {/* Xóa hóa đơn */}
                          <button
                            title="Xóa hóa đơn"
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="btn-icon btn-icon-danger"
                            disabled={actionLoading}
                          >
                            🗑️
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Chưa ghi nhận hóa đơn nào trong cơ sở dữ liệu.
                  </td>
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
