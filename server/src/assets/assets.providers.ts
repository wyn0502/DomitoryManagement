import { DataSource } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { RoomAsset } from './entities/room-asset.entity';
import { Room } from '../rooms/entities/room.entity';

export const assetsProviders = [
  {
    provide: 'ASSET_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Asset),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ROOM_ASSET_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RoomAsset),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ROOM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Room),
    inject: ['DATA_SOURCE'],
  },
];