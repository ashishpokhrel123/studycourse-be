import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Course } from './course.entity';
import { University } from './university.entity';
import { Subject } from './subject.entity';

@Entity()
export class UniversityCourseSubject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => University, (university) => university.courseSubject)
  university: University;

  @ManyToOne(() => Course, (course) => course.universityCourseSubject)
  course: Course;

  @ManyToOne(() => Subject, (subject) => subject.universityCourseSubject)
  subject: Subject;

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
