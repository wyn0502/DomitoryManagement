import React, { useState, useEffect, FormEvent } from 'react';
import {
  ArrowRepeat, ExclamationTriangleFill, CheckCircleFill, Tools, BoxSeamFill,
  PlusCircleFill, PencilFill, TrashFill, HouseDoorFill, Save2Fill, XLg,
  PersonBadgeFill, CheckLg,
} from 'react-bootstrap-icons';

interface Asset {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
}

interface RoomLite {
  id: number;
  room_name: string;
  capacity?: number;
  current_occupancy?: number;
}

interface RoomAssetRow {
  id: number;
  room_id: number;
  asset_id: number;
  quantity: number;
  status: 'new' | 'used' | 'broken';
  asset?: Asset;
  room?: RoomLite;
}

interface AssetsAdminProps {
  token: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';


const AssetsAdmin: React.FC<AssetsAdminProps> = ({ token }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rooms, setRooms] = useState<RoomLite[]>([]);
  const [allocations, setAllocations] = useState<RoomAssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form tạo/sửa asset catalog
  const emptyAssetForm = { name: '', description: '' };
  const [assetForm, setAssetForm] = useState(emptyAssetForm);
  const [editingAssetId, setEditingAssetId] = useState<number | null>(null);

  // Form phân bổ tài sản
  const emptyAllocForm = { room_id: '', asset_id: '', quantity: '1', status: 'new' as 'new' | 'used' | 'broken' };
  const [allocForm, setAllocForm] = useState(emptyAllocForm);

  const [searchQuery, setSearchQuery] = useState('');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [aRes, rRes, alRes] = await Promise.all([
        fetch(`${API}/api/assets`, { headers }),
        fetch(`${API}/api/rooms`, { headers }),
        fetch(`${API}/api/assets/allocations/all`, { headers }),
      ]);
      if (!aRes.ok || !rRes.ok || !alRes.ok) {
        throw new Error('Không tải được dữ liệu tài sản/phòng từ máy chủ');
      }
      setAssets(await aRes.json());
      setRooms(await rRes.json());
      setAllocations(await alRes.json());
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

  // ====== CRUD asset catalog ======
  const handleSaveAsset = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const url = editingAssetId ? `${API}/api/assets/${editingAssetId}` : `${API}/api/assets`;
      const method = editingAssetId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          name: assetForm.name.trim(),
          description: assetForm.description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi lưu tài sản');
      setSuccess(editingAssetId ? 'Đã cập nhật tài sản!' : 'Đã thêm tài sản mới!');
      setAssetForm(emptyAssetForm);
      setEditingAssetId(null);
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const startEditAsset = (a: Asset) => {
    setEditingAssetId(a.id);
    setAssetForm({ name: a.name, description: a.description || '' });
  };

  const cancelEditAsset = () => {
    setEditingAssetId(null);
    setAssetForm(emptyAssetForm);
  };

  const deleteAsset = async (id: number, name: string) => {
    if (!window.confirm(`Xóa tài sản "${name}" khỏi danh mục?`)) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/assets/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xóa tài sản');
      setSuccess(data.message || 'Đã xóa tài sản');
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  // ====== Phân bổ tài sản vào phòng ======
  const handleAllocate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/assets/allocations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          room_id: parseInt(allocForm.room_id, 10),
          asset_id: parseInt(allocForm.asset_id, 10),
          quantity: parseInt(allocForm.quantity, 10) || 1,
          status: allocForm.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi phân bổ tài sản');
      setSuccess('Phân bổ tài sản vào phòng thành công!');
      setAllocForm(emptyAllocForm);
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const updateAllocationRow = async (id: number, patch: Partial<RoomAssetRow>) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/assets/allocations/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật phân bổ');
      setSuccess('Đã cập nhật phân bổ!');
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const removeAllocation = async (id: number) => {
    if (!window.confirm('Xóa phân bổ tài sản khỏi phòng này?')) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/api/assets/allocations/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xóa phân bổ');
      setSuccess(data.message || 'Đã xóa phân bổ');
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading && assets.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 className="d-flex align-items-center justify-content-center gap-2">
          <ArrowRepeat size={28} /> Đang tải dữ liệu thiết bị...
        </h2>
      </div>
    );
  }

  const filteredAssets = assets.filter((a) =>
    !searchQuery.trim() ||
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Nhóm phân bổ theo phòng
  const allocByRoom: Record<number, RoomAssetRow[]> = {};
  allocations.forEach((row) => {
    if (!allocByRoom[row.room_id]) allocByRoom[row.room_id] = [];
    allocByRoom[row.room_id].push(row);
  });

  const roomsWithAssets = rooms.filter((r) => allocByRoom[r.id]);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="d-flex align-items-center gap-2 mb-1" style={{ color: 'var(--text-primary)' }}>
            <Tools /> Quản lý Trang thiết bị & Cơ sở vật chất
          </h3>
          <p className="text-secondary mb-0">Danh mục tài sản và phân bổ cho từng phòng ký túc xá.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={busy} style={{ width: 'auto' }}>
          <ArrowRepeat /> Làm mới
        </button>
      </div>

      {error && <div className="alert alert-danger"><ExclamationTriangleFill /> {error}</div>}
      {success && <div className="alert alert-success"><CheckCircleFill /> {success}</div>}

      {/* DANH MỤC TÀI SẢN */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="section-title mb-0">
            <BoxSeamFill className="text-primary" /> Danh mục tài sản ({filteredAssets.length}/{assets.length})
          </h2>
          <input
            type="text"
            className="form-input"
            placeholder="Tìm tên tài sản..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 'auto', minWidth: '240px' }}
          />
        </div>

        <div className="dashboard-layout" style={{ marginBottom: '1.5rem' }}>
          {/* Form thêm/sửa asset */}
          <div className="glass-panel" style={{ border: editingAssetId ? '1px solid var(--primary)' : undefined }}>
            <h3 className="section-title" style={{ fontSize: '1.05rem' }}>
              {editingAssetId ? <PencilFill style={{ color: 'var(--primary)' }} /> : <PlusCircleFill className="text-success" />}
              {' '}{editingAssetId ? `Sửa tài sản #${editingAssetId}` : 'Thêm tài sản mới'}
            </h3>
            <form onSubmit={handleSaveAsset}>
              <div className="form-group">
                <label className="form-label">Tên tài sản *</label>
                <input
                  className="form-input"
                  placeholder="VD: Giường tầng, Điều hòa..."
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Thông tin chi tiết..."
                  value={assetForm.description}
                  onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })}
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success" disabled={busy} style={{ width: 'auto' }}>
                  <Save2Fill /> {editingAssetId ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
                {editingAssetId && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEditAsset} disabled={busy} style={{ width: 'auto' }}>
                    <XLg /> Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Bảng danh mục */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Mã</th>
                  <th>Tên tài sản</th>
                  <th>Mô tả</th>
                  <th style={{ textAlign: 'center', width: 130 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Chưa có tài sản nào trong danh mục.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((a) => (
                    <tr key={a.id}>
                      <td><strong>#{a.id}</strong></td>
                      <td><strong>{a.name}</strong></td>
                      <td className="text-secondary">{a.description || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="actions-cell" style={{ justifyContent: 'center' }}>
                          <button className="btn-icon" title="Sửa" onClick={() => startEditAsset(a)} disabled={busy}>
                            <PencilFill size={14} />
                          </button>
                          <button className="btn-icon btn-icon-danger" title="Xóa" onClick={() => deleteAsset(a.id, a.name)} disabled={busy}>
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
      </div>

      {/* PHÂN BỔ TÀI SẢN */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">
          <PersonBadgeFill className="text-warning" /> Phân bổ tài sản vào phòng
        </h2>

        <form onSubmit={handleAllocate} className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group mb-0">
              <label className="form-label">Phòng *</label>
              <select
                className="form-input form-select"
                value={allocForm.room_id}
                onChange={(e) => setAllocForm({ ...allocForm, room_id: e.target.value })}
                required
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.room_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Tài sản *</label>
              <select
                className="form-input form-select"
                value={allocForm.asset_id}
                onChange={(e) => setAllocForm({ ...allocForm, asset_id: e.target.value })}
                required
              >
                <option value="">-- Chọn tài sản --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Số lượng</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={allocForm.quantity}
                onChange={(e) => setAllocForm({ ...allocForm, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Tình trạng</label>
              <select
                className="form-input form-select"
                value={allocForm.status}
                onChange={(e) => setAllocForm({ ...allocForm, status: e.target.value as any })}
              >
                <option value="new">Mới</option>
                <option value="used">Đã sử dụng</option>
                <option value="broken">Hỏng</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: 'auto' }}>
            <CheckLg /> Phân bổ / Cập nhật
          </button>
        </form>

        <div className="table-container">
          <h3 className="chart-title"><HouseDoorFill className="text-primary" /> Danh sách phân bổ theo phòng ({roomsWithAssets.length})</h3>
          {roomsWithAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Chưa có phân bổ tài sản nào cho phòng nào.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Tài sản</th>
                  <th>Số lượng</th>
                  <th>Tình trạng</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {roomsWithAssets.map((room) =>
                  allocByRoom[room.id].map((row, idx) => (
                    <tr key={row.id}>
                      {idx === 0 ? (
                        <td rowSpan={allocByRoom[room.id].length}>
                          <strong className="d-flex align-items-center gap-1" style={{ color: 'var(--primary)' }}>
                            <HouseDoorFill /> {room.room_name}
                          </strong>
                        </td>
                      ) : null}
                      <td><strong>{row.asset?.name || `Tài sản #${row.asset_id}`}</strong></td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => updateAllocationRow(row.id, { quantity: parseInt(e.target.value, 10) || 1 })}
                          disabled={busy}
                          style={{ width: 80 }}
                          className="form-input"
                        />
                      </td>
                      <td>
                        <select
                          className="form-input form-select"
                          value={row.status}
                          onChange={(e) => updateAllocationRow(row.id, { status: e.target.value as any })}
                          disabled={busy}
                          style={{ width: 'auto' }}
                        >
                          <option value="new">Mới</option>
                          <option value="used">Đã sử dụng</option>
                          <option value="broken">Hỏng</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-icon btn-icon-danger"
                          title="Xóa phân bổ"
                          onClick={() => removeAllocation(row.id)}
                          disabled={busy}
                        >
                          <TrashFill size={14} />
                        </button>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetsAdmin;