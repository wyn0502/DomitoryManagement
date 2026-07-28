import { DataSource } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { Room } from '../rooms/entities/room.entity';
import { User } from '../auth/entities/user.entity';

export const ticketsProviders = [
  {
    provide: 'TICKET_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Ticket),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ROOM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Room),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
];