import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subjectName: string;

  @Column({nullable:true})
  description: string;

  @Column({ default: false })
  isFeatured: boolean;

  @ManyToOne(() => Course, (course) => course.subject)
  course: Course;

  @Column({ nullable: true})
  startDate: Date;

  @Column({ nullable: true})
  duration: number;

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
