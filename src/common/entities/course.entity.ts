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
import { StudyLevel } from './studyLevel.entity';
import { Subject } from './subject.entity';
import { University } from './university.entity';

@Entity()
export class Course {
  push(course: Course) {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseName: string;

  @Column()
  slug: string;

  @Column()
  description: string;

  @Column({ default: false })
  isFeatured: boolean;

  @ManyToOne(() => StudyLevel, (studyLevel) => studyLevel.course)
  studyLevel: StudyLevel;

  @OneToMany(() => Subject, (subject) => subject.course)
  subject: Subject;

  @ManyToMany(() => University, (university) => university.courses)
  @JoinTable()
  universities: University[];

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
