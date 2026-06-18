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
        synchronize: true, // Chỉ dùng cho phát triển (dev)
        ssl: sslConfig,
      });

      return dataSource.initialize();
    },
  },
];
