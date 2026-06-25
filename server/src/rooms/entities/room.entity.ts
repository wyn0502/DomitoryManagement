import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { UtilityMeter } from '../../invoices/entities/utility-meter.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  room_name: string;

  @Column({ type: 'int', default: 4 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  current_occupancy: number;

  @Column({ default: 'Thường' })
  type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 1500000.00 })
  fixed_rent: number;

  @OneToMany(() => User, (user) => user.room)
  students: User[];

  @OneToMany(() => UtilityMeter, (meter) => meter.room)
  utilityMeters: UtilityMeter[];

  @OneToMany(() => Invoice, (invoice) => invoice.room)
  invoices: Invoice[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
