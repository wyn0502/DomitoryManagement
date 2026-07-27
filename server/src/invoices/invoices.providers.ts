import { DataSource } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { UtilityMeter } from './entities/utility-meter.entity';
import { User } from '../auth/entities/user.entity';

export const invoicesProviders = [
  {
    provide: 'INVOICE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Invoice),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'UTILITY_METER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UtilityMeter),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
];
