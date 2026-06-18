import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { UtilityMeter } from './utility-meter.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id' })
  room_id: number;

  @ManyToOne(() => Room, (room) => room.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ name: 'utility_meter_id', nullable: true })
  utility_meter_id: number;

  @ManyToOne(() => UtilityMeter, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'utility_meter_id' })
  utilityMeter: UtilityMeter;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  room_fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  electricity_fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  water_fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'enum', enum: ['unpaid', 'paid'], default: 'unpaid' })
  status: 'unpaid' | 'paid';

  @Column({ type: 'bigint', nullable: true, unique: true })
  payos_order_code: number; // Lưu mã đơn hàng PayOS dùng để đối soát qua Webhook

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
