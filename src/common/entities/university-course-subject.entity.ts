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

    @ManyToOne(() => University, (university) => university.courseSubject, {
    onDelete: 'CASCADE', // Ensure that related entries are deleted when a university is deleted
  })
  university: University;

  @ManyToOne(() => Course, (course) => course.universityCourseSubject, {
    onDelete: 'CASCADE', // Ensure that related entries are deleted when a course is deleted
  })
  course: Course;

  @ManyToOne(() => Subject, (subject) => subject.universityCourseSubject, {
    cascade: ['remove'], // Allows automatic removal of related subjects
    onDelete: 'CASCADE', // Ensures that related entries are deleted when a subject is deleted
  })
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
