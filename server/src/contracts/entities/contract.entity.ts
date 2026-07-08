import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Room } from 'src/rooms/entities/room.entity';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ManyToOne(() => User, (user) => user.contracts)
  userId: number;

  @Column()
  @ManyToOne(() => Room, (room) => room.contracts)
  roomId: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: String;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.contracts)
  user: User;

  @ManyToOne(() => Room, (room) => room.contracts)
  room: Room;
}