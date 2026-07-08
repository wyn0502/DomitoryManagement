import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Room } from 'src/rooms/entities/room.entity';

@Entity('buildings')
export class Building {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({type : 'varchar', nullable: true})
    description: string | null;

    @OneToMany(() => Room, (room) => room.building)
    rooms: Room[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}