import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChartLineFill, PieChartFill } from 'react-bootstrap-icons';

// Đăng ký các thành phần Chart.js cần dùng (bắt buộc với Chart.js v4)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface MonthlyRevenueItem {
  label: string;
  value: number;
}

interface StatusRatioItem {
  status: string;
  count: number;
}

interface RevenueChartProps {
  monthlyRevenue: MonthlyRevenueItem[];
  statusRatio: StatusRatioItem[];
}

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const RevenueChart: React.FC<RevenueChartProps> = ({ monthlyRevenue, statusRatio }) => {
  // --- Biểu đồ cột: Doanh thu theo tháng (SUM(total_amount) GROUP BY month) ---
  const barData = {
    labels: monthlyRevenue.map((item) => item.label),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: monthlyRevenue.map((item) => item.value),
        backgroundColor: 'rgba(30, 58, 138, 0.8)',
        borderColor: 'rgba(30, 58, 138, 1)',
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 56,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => formatVND(Number(ctx.raw || 0)),
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
          callback: (value: string | number) =>
            new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(Number(value)),
        },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
    },
  };

  // --- Biểu đồ tròn: Cơ cấu trạng thái hóa đơn (COUNT GROUP BY status) ---
  const doughnutData = {
    labels: statusRatio.map((item) => item.status),
    datasets: [
      {
        label: 'Số hóa đơn',
        data: statusRatio.map((item) => item.count),
        backgroundColor: statusRatio.map((item) =>
          item.status === 'Đã thanh toán' ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)',
        ),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#475569', padding: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'doughnut'>) => ` ${ctx.label}: ${ctx.raw} hóa đơn`,
        },
      },
    },
  };

  const hasRevenue = monthlyRevenue && monthlyRevenue.length > 0;
  const hasStatus = statusRatio && statusRatio.length > 0;

  return (
    <div className="charts-grid">
      <div className="chart-container">
        <h3 className="chart-title"><BarChartLineFill className="text-primary" /> Doanh Thu Theo Tháng (Chart.js)</h3>
        <div style={{ height: '320px' }}>
          {hasRevenue ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Không có số liệu doanh thu thực tế.
            </div>
          )}
        </div>
      </div>

      <div className="chart-container">
        <h3 className="chart-title"><PieChartFill className="text-primary" /> Tỉ Lệ Hóa Đơn Theo Trạng Thái (Chart.js)</h3>
        <div style={{ height: '320px' }}>
          {hasStatus ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Không có dữ liệu trạng thái.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
