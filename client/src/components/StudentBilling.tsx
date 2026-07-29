import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleFill, HourglassSplit, FileEarmarkTextFill,
  CheckLg, XLg, CreditCard2Front, CheckCircleFill, ArrowRepeat, DoorOpenFill,
} from 'react-bootstrap-icons';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  room_id: number | null;
  room_name: string | null;
  full_name: string;
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
  room?: {
    room_name: string;
    type?: string;
  };
}

interface PaymentResultState {
  success: boolean;
  orderCode: string;
  message: string;
}

interface StudentBillingProps {
  token: string;
  user: User;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const StudentBilling: React.FC<StudentBillingProps> = ({ token, user }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [payLoading, setPayLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Payment redirect parameters checking
  const [paymentResult, setPaymentResult] = useState<PaymentResultState | null>(null);

  const fetchRoomInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Không thể lấy danh sách hóa đơn cho tài khoản của bạn.');
      }

      const data = await res.json();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomInvoices();

    // Check URL parameters for redirection status from PayOS
    const queryParams = new URLSearchParams(window.location.search);
    const status = queryParams.get('status');
    const orderCode = queryParams.get('orderCode');
    const cancel = queryParams.get('cancel');

    if (status === 'PAID' || status === 'success') {
      setPaymentResult({
        success: true,
        orderCode: orderCode || 'Chưa xác định',
        message: 'Giao dịch chuyển khoản qua ngân hàng (VietQR) đã được xử lý thành công!',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (cancel === 'true' || status === 'CANCELLED') {
      setPaymentResult({
        success: false,
        orderCode: orderCode || 'Chưa xác định',
        message: 'Giao dịch thanh toán đã bị hủy bởi người dùng.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handlePay = async (invoiceId: number) => {
    setPayLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API}/api/invoices/${invoiceId}/payment-url`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khởi tạo cổng thanh toán.');
      }

      if (data.paymentUrl) {
        setSuccess('Đang chuyển hướng bạn sang cổng thanh toán VietQR PayOS...');
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Cổng thanh toán không phản hồi địa chỉ URL thanh toán.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối cổng thanh toán');
      setPayLoading(false);
    }
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

  if (loading && invoices.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 className="d-flex align-items-center justify-content-center gap-2">
          <ArrowRepeat size={28} /> Đang tải hóa đơn của bạn...
        </h2>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Info */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Hóa Đơn & Thanh Toán Cá Nhân</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Họ tên: <strong>{user.full_name || user.username}</strong> | Phòng KTX: <strong>{user.room_name ? <span style={{ color: 'var(--primary)' }}><DoorOpenFill /> {user.room_name}</span> : 'Chưa xếp phòng'}</strong>
        </p>
      </div>

      {error && <div className="alert alert-danger"><ExclamationTriangleFill /> {error}</div>}
      {success && <div className="alert alert-success"><HourglassSplit /> {success}</div>}

      {/* Payment Result Banner */}
      {paymentResult && (
        <div className="glass-panel payment-success-card" style={{ marginBottom: '2.5rem' }}>
          <div
            className="success-icon-wrap"
            style={{
              backgroundColor: paymentResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderColor: paymentResult.success ? 'var(--success)' : 'var(--danger)',
              color: paymentResult.success ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {paymentResult.success ? <CheckLg size={40} /> : <XLg size={36} />}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {paymentResult.success ? 'Thanh Toán Thành Công' : 'Thanh Toán Bị Hủy'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {paymentResult.message}
          </p>

          <div className="payment-details">
            <div className="detail-row">
              <span className="detail-label">Cổng Thanh Toán</span>
              <span className="detail-value">VietQR (PayOS)</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Mã Giao Dịch (Order Code)</span>
              <span className="detail-value">#{paymentResult.orderCode}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Trạng Thái Đơn Hàng</span>
              <span
                className="detail-value"
                style={{ color: paymentResult.success ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}
              >
                {paymentResult.success ? 'ĐÃ HOÀN TẤT' : 'ĐÃ HỦY BỎ'}
              </span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => { setPaymentResult(null); fetchRoomInvoices(); }} style={{ maxWidth: '200px', margin: '0 auto' }}>
            Quay lại danh sách
          </button>
        </div>
      )}

      {/* Invoices Table */}
      <div className="glass-panel">
        <h2 className="section-title"><FileEarmarkTextFill className="text-primary" /> Danh Sách Hóa Đơn Chi Tiết</h2>
        <div className="table-container">
          <table className="data-table" style={{ fontSize: '0.88rem' }}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Loại dịch vụ</th>
                <th>Tên dịch vụ</th>
                <th>Nội dung chi tiết</th>
                <th>Số tiền thanh toán</th>
                <th>Phát sinh</th>
                <th>Hạn thanh toán</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'center' }}>Thanh Toán Quét Mã VietQR</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((inv, idx) => {
                  const isPaid = inv.status === 'paid';

                  return (
                    <tr key={inv.id}>
                      <td><strong>#{idx + 1}</strong></td>
                      <td>
                        <span className={`badge ${inv.service_type === 'Phòng' ? 'badge-paid' : 'badge-unpaid'}`} style={{ fontSize: '0.75rem' }}>
                          {inv.service_type || 'Điện nước'}
                        </span>
                      </td>
                      <td><strong>{inv.service_name || `Tiền ${inv.service_type} tháng ${inv.month}/${inv.year}`}</strong></td>
                      <td className="text-muted" style={{ maxWidth: '220px', fontSize: '0.8rem' }}>{inv.content || '—'}</td>
                      <td>
                        <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                          {Number(inv.total_amount || 0).toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td>{formatDate(inv.created_at)}</td>
                      <td>{formatDate(inv.due_date)}</td>
                      <td>
                        <span className={`badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                          {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isPaid ? (
                          <span className="d-inline-flex align-items-center gap-1" style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            <CheckCircleFill /> Đã hoàn tất ({formatDate(inv.paid_at)})
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePay(inv.id)}
                            className="btn btn-primary d-inline-flex align-items-center gap-1"
                            style={{
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.8rem',
                              width: 'auto',
                              boxShadow: 'none',
                            }}
                            disabled={payLoading}
                          >
                            <CreditCard2Front /> Quét mã VietQR
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Tài khoản của bạn hiện chưa có hóa đơn nào được ghi nhận.
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

export default StudentBilling;
