import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('DATA_SOURCE')
    private dataSource: DataSource
  ) {}

  async getAdminStats(): Promise<any> {
    // 1. Thống kê tổng doanh thu (SUM)
    const revenueQuery = await this.dataSource.query(
      `SELECT SUM(total_amount) as total_revenue FROM invoices WHERE status = 'paid'`
    );
    const totalRevenue = parseFloat(revenueQuery[0]?.total_revenue || '0');

    // 2. Thống kê tổng tiền chưa thanh toán (SUM)
    const unpaidQuery = await this.dataSource.query(
      `SELECT SUM(total_amount) as total_unpaid FROM invoices WHERE status = 'unpaid'`
    );
    const totalUnpaid = parseFloat(unpaidQuery[0]?.total_unpaid || '0');

    // 3. Đếm tổng số lượng hóa đơn (COUNT)
    const invoiceCountQuery = await this.dataSource.query(
      `SELECT COUNT(*) as invoice_count FROM invoices`
    );
    const invoiceCount = parseInt(invoiceCountQuery[0]?.invoice_count || '0', 10);

    // 4. Đếm số lượng phòng (COUNT)
    const roomCountQuery = await this.dataSource.query(
      `SELECT COUNT(*) as room_count FROM rooms`
    );
    const roomCount = parseInt(roomCountQuery[0]?.room_count || '0', 10);

    // 5. Thống kê biểu đồ doanh thu theo tháng (SUM, GROUP BY)
    const monthlyRevenue = await this.dataSource.query(
      `SELECT month, year, SUM(total_amount) as revenue 
       FROM invoices 
       WHERE status = 'paid' 
       GROUP BY year, month 
       ORDER BY year ASC, month ASC`
    );

    // 6. Cơ cấu trạng thái hóa đơn (COUNT, GROUP BY)
    const statusRatio = await this.dataSource.query(
      `SELECT status, COUNT(*) as count 
       FROM invoices 
       GROUP BY status`
    );

    return {
      cards: {
        totalRevenue,
        totalUnpaid,
        invoiceCount,
        roomCount,
      },
      monthlyRevenue: monthlyRevenue.map((item: any) => ({
        label: `Tháng ${item.month}/${item.year}`,
        value: parseFloat(item.revenue || '0'),
      })),
      statusRatio: statusRatio.map((item: any) => ({
        status: item.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán',
        count: parseInt(item.count || '0', 10),
      })),
    };
  }
}
