import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

@Entity('utility_meters')
@Unique(['room_id', 'month', 'year'])
export class UtilityMeter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id' })
  room_id: number;

  @ManyToOne(() => Room, (room) => room.utilityMeters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column()
  electricity_index: number;

  @Column()
  water_index: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
