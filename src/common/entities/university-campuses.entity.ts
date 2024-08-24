import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { University } from './university.entity';

@Entity()
export class UniversityCampuses {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  contact: string;

  @ManyToOne(() => University, university => university.campuses)
  university: University;

  @Column({ nullable: true, type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true, type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;
}
