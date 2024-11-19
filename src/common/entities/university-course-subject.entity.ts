import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Course } from './course.entity';
import { University } from './university.entity';

@Entity()
export class UniversityCourseSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => University, (university) => university.courseSubject, {
    onDelete: 'CASCADE', 
  })
  university: University;

  @ManyToOne(() => Course, (course) => course.universityCourseSubject, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @Column()
  courseContents: string;

  // Audit fields
  @Column({ type: 'timestamptz', nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  deletedBy: string;

  // Status fields
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeleted: boolean;
}
