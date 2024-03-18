import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  username: string;

  @Column()
  text: string;

  @CreateDateColumn()
  timestamp: Date;
}
