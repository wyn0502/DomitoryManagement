import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password?: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: ['admin', 'student'], default: 'student' })
  role: 'admin' | 'student';

  @Column({ name: 'room_id', nullable: true })
  room_id: number;

  @ManyToOne(() => Room, (room) => room.students, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  // Các thuộc tính cư dân (SV2 - Đông)
  @Column({ nullable: true })
  full_name: string;

  @Column({ unique: true, nullable: true })
  mssv: string;

  @Column({ nullable: true })
  hometown: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  class_name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
