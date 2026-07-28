import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('room_assets')
export class RoomAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  room_id: number;

  @Column({ type: 'int' })
  asset_id: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'enum', enum: ['new', 'used', 'broken'], default: 'new' })
  status: 'new' | 'used' | 'broken';

  @ManyToOne(() => Room, (room) => room.students, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Asset, (asset) => asset.roomAssets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}