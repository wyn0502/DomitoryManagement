import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  room_id: number | null;
  room_name: string | null;
  full_name: string;
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

interface PaymentResultState {
  success: boolean;
  orderCode: string;
  message: string;
}

interface StudentBillingProps {
  token: string;
  user: User;
}

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
      const res = await fetch('http://localhost:3000/api/invoices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Không thể lấy danh sách hóa đơn cho phòng của bạn.');
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
      // Clear URL parameters to prevent showing banner on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (cancel === 'true' || status === 'CANCELLED') {
      setPaymentResult({
        success: false,
        orderCode: orderCode || 'Chưa xác định',
        message: 'Giao dịch thanh toán đã bị hủy bởi người dùng.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [token]);

  const handlePay = async (invoiceId: number) => {
    setPayLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`http://localhost:3000/api/invoices/${invoiceId}/payment-url`, {
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
        // Redirect the user to PayOS payment link
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Cổng thanh toán không phản hồi địa chỉ URL thanh toán.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối cổng thanh toán');
      setPayLoading(false);
    }
  };

  if (loading && invoices.length === 0) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}><h2>🚀 Đang tải hóa đơn của phòng...</h2></div>;
  }

  return (
    <div className="main-content" style={{ animation: 'slideIn 0.4s ease-out' }}>
      
      {/* 1. Header & Quick Info */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Hóa Đơn Phòng Của Tôi</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Họ tên sinh viên: <strong>{user.full_name}</strong> | Phòng: <strong>{user.room_name || 'Chưa xếp phòng'}</strong>
        </p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">⏳ {success}</div>}

      {/* 2. Payment Redirect Return Message Banner */}
      {paymentResult && (
        <div className="glass-panel payment-success-card" style={{ marginBottom: '2.5rem' }}>
          <div 
            className="success-icon-wrap" 
            style={{ 
              backgroundColor: paymentResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderColor: paymentResult.success ? 'var(--success)' : 'var(--danger)',
              color: paymentResult.success ? 'var(--success)' : 'var(--danger)'
            }}
          >
            {paymentResult.success ? '✓' : '✗'}
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
            Quay lại trang hóa đơn
          </button>
        </div>
      )}

      {/* 3. Room Invoices Table */}
      <div className="glass-panel">
        <h2 className="section-title">📄 Danh Sách Hóa Đơn Điện Nước & Phòng</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tháng/Năm</th>
                <th>Chỉ số Điện tiêu thụ</th>
                <th>Chỉ số Nước tiêu thụ</th>
                <th>Tiền Phòng Cố Định</th>
                <th>Tiền Điện (3.000đ)</th>
                <th>Tiền Nước (15.000đ)</th>
                <th>Tổng Cộng</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'center' }}>Thanh Toán</th>
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
                      <td>{Number(inv.room_price || 0).toLocaleString('vi-VN')} đ</td>
                      <td>{Number(inv.electricity_amount || 0).toLocaleString('vi-VN')} đ</td>
                      <td>{Number(inv.water_amount || 0).toLocaleString('vi-VN')} đ</td>
                      <td>
                        <strong style={{ color: 'var(--primary)' }}>
                          {Number(inv.total_amount || 0).toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                          {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isPaid ? (
                          <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            ✓ Đã hoàn tất
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePay(inv.id)}
                            className="btn btn-primary"
                            style={{ 
                              padding: '0.4rem 0.8rem', 
                              fontSize: '0.8rem', 
                              width: 'auto',
                              boxShadow: 'none'
                            }}
                            disabled={payLoading}
                          >
                            💳 Quét mã VietQR
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Phòng của bạn chưa có bất kỳ hóa đơn nào được ghi nhận.
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
