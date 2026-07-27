import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Import all entities
import { User } from '../auth/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { UtilityMeter } from '../invoices/entities/utility-meter.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      // Xác định đường dẫn file cert ca.pem
      const caPath = process.env.DB_SSL_CA_PATH || path.resolve(__dirname, '../../assets/ca.pem');
      let sslConfig: any = null;

      if (process.env.DB_SSL === 'true') {
        try {
          if (fs.existsSync(caPath)) {
            sslConfig = {
              ca: fs.readFileSync(caPath).toString(),
            };
          } else {
            console.warn(`[Database] WARNING: Không tìm thấy file cert SSL tại ${caPath}. Kết nối SSL không sử dụng file CA.`);
            sslConfig = { rejectUnauthorized: false };
          }
        } catch (err) {
          console.error('[Database] Lỗi đọc file CA SSL:', err.message);
          sslConfig = { rejectUnauthorized: false };
        }
      }

      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'quan_ly_ktx',
        entities: [User, Room, Invoice, UtilityMeter],
        synchronize: process.env.DB_SYNCHRONIZE === 'true', // Tắt đồng bộ tự động nếu đã import file SQL
        ssl: sslConfig,
      });

      const ds = await dataSource.initialize();

      // Migration an toàn bổ sung cột mới nếu DB cloud chưa có
      try {
        const userCols = [
          'cccd VARCHAR(50) NULL',
          'gender VARCHAR(20) NULL',
        ];
        for (const col of userCols) {
          const colName = col.split(' ')[0];
          try {
            await ds.query(`ALTER TABLE users ADD COLUMN ${col};`);
            console.log(`[DB Migration] Added column users.${colName}`);
          } catch (e: any) {
            if (!e.message.includes('Duplicate column')) {
              console.log(`[DB Migration Notice users.${colName}]:`, e.message);
            }
          }
        }

        // Tự động chuẩn hóa dữ liệu trạng thái phòng cho các tài khoản hiện có trong DB
        try {
          await ds.query("UPDATE users SET room_status = 'approved' WHERE room_id IS NOT NULL AND (room_status IS NULL OR room_status = '');");
          await ds.query("UPDATE users SET room_status = 'none' WHERE room_id IS NULL AND (room_status IS NULL OR room_status = '');");
        } catch (e: any) {
          console.log('[DB Migration Notice heal room_status]:', e.message);
        }

        const invCols = [
          'user_id INT NULL',
          "service_type VARCHAR(100) NULL DEFAULT 'Điện nước'",
          'service_name VARCHAR(255) NULL',
          'content TEXT NULL',
          'due_date DATE NULL',
          'paid_at DATE NULL',
        ];
        for (const col of invCols) {
          const colName = col.split(' ')[0];
          try {
            await ds.query(`ALTER TABLE invoices ADD COLUMN ${col};`);
            console.log(`[DB Migration] Added column invoices.${colName}`);
          } catch (e: any) {
            if (!e.message.includes('Duplicate column')) {
              console.log(`[DB Migration Notice invoices.${colName}]:`, e.message);
            }
          }
        }

        // Tạo bảng thông báo (announcements) nếu chưa có & thêm dữ liệu mẫu
        try {
          await ds.query(`
            CREATE TABLE IF NOT EXISTS announcements (
              id INT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          const existingAnn: any[] = await ds.query('SELECT COUNT(*) as count FROM announcements');
          if (existingAnn && existingAnn[0] && parseInt(existingAnn[0].count, 10) === 0) {
            await ds.query(`
              INSERT INTO announcements (title, content) VALUES
              ('Thông báo đóng tiền phòng tháng 6/2026', 'Yêu cầu tất cả sinh viên ký túc xá hoàn thành đóng tiền phòng và tiền điện nước trước ngày 30/06/2026.'),
              ('Bảo trì điều hòa phòng VIP ngày 22/06', 'Ban cơ sở vật chất sẽ thực hiện bảo trì định kỳ hệ thống điều hòa tại các phòng loại VIP vào ngày 22/06/2026.');
            `);
            console.log('[DB Migration] Seeded default announcements');
          }
        } catch (e: any) {
          console.log('[DB Migration Notice announcements]:', e.message);
        }
      } catch (err: any) {
        console.warn('[DB Migration] Notice:', err.message);
      }

      return ds;
    },
  },
];
