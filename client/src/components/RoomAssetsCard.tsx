import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { Tools, ArrowRepeat } from 'react-bootstrap-icons';

interface AssetLite {
  id: number;
  name: string;
  description: string | null;
}

interface RoomAssetRow {
  id: number;
  room_id: number;
  asset_id: number;
  quantity: number;
  status: 'new' | 'used' | 'broken';
  asset?: AssetLite;
}

interface RoomAssetsCardProps {
  token: string;
  roomId: number | null;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'Mới', bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  used: { label: 'Đang dùng', bg: 'rgba(245,158,11,0.15)', color: '#b45309' },
  broken: { label: 'Hỏng', bg: 'rgba(239,68,68,0.15)', color: '#b91c1c' },
};

const RoomAssetsCard: React.FC<RoomAssetsCardProps> = ({ token, roomId }) => {
  const [list, setList] = useState<RoomAssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }
    const fetchAssets = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API}/api/assets/room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Không tải được danh sách thiết bị');
        setList(await res.json());
      } catch (e: any) {
        setError(e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ.' : e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [token, roomId]);

  if (!roomId) {
    return (
      <Card className="border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-glass)' }}>
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Tools className="text-primary" /> Thiết bị trong phòng
        </h5>
        <div className="text-center text-secondary py-3">
          Bạn chưa được xếp phòng nên chưa có thiết bị được phân bổ.
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-glass)' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Tools className="text-primary" /> Thiết bị trong phòng
        </h5>
        <span className="badge bg-primary bg-opacity-10 text-primary">{list.length} thiết bị</span>
      </div>

      {loading ? (
        <div className="text-center py-3"><Spinner animation="border" variant="primary" size="sm" /></div>
      ) : error ? (
        <Alert variant="danger" className="mb-0 py-2"><small>{error}</small></Alert>
      ) : list.length === 0 ? (
        <div className="text-center text-secondary py-3">
          Phòng của bạn hiện chưa được phân bổ thiết bị nào.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2" style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {list.map((row) => {
            const badge = STATUS_BADGE[row.status] || STATUS_BADGE.used;
            return (
              <div
                key={row.id}
                className="d-flex justify-content-between align-items-center gap-2 p-2 rounded-3"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <div style={{ minWidth: 0 }}>
                  <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {row.asset?.name || `Tài sản #${row.asset_id}`}
                  </h6>
                  {row.asset?.description && (
                    <small className="text-secondary text-truncate d-block">{row.asset.description}</small>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <span
                    className="badge"
                    style={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 600 }}
                  >
                    {badge.label}
                  </span>
                  <span className="fw-bold" style={{ color: 'var(--primary)' }}>×{row.quantity}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-2 small text-muted d-flex align-items-center gap-1">
        <ArrowRepeat size={11} /> Cập nhật tự động khi Admin phân bổ thiết bị mới.
      </div>
    </Card>
  );
};

export default RoomAssetsCard;