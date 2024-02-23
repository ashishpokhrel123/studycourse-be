import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { University } from './university.entity';
import { ScUser } from './user.entity';

@Entity()
export class Destination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => University, (university) => university.destination)
  universities: University[];

  @OneToMany(() => ScUser, (user) => user.destination, { nullable: true })
  user: ScUser;

  @Column({ nullable: true, type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true, type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;

  @Column({ nullable: true })
  deletedBy: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDelete: boolean;
}
