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
import { FinanceDetails } from './financeDetails-university.entity';
import { Destination } from './destination';
import { Course } from './course.entity';
import { UniversityCampuses } from './university-campuses.entity';
import { UniversityCourseSubject } from './university-course-subject.entity';

@Entity()
export class University {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  universityName: string;


  @Column()
  slug: string;

  @Column()
  worldRanking: number;

  // @Column()
  // countryRanking: number;

  @Column({ nullable: true })
  universityImage: string;

  @Column()
  description: string;

  @Column({ default: false })
  isFeatured: boolean;

  

  @OneToOne(() => FinanceDetails, (fd) => fd.university) // specify inverse side as a second parameter
  financeDetails: FinanceDetails;

  @OneToMany(() => UniversityCourseSubject, (ucs) => ucs.university) // specify inverse side as a second parameter
  courseSubject: UniversityCourseSubject;

  @OneToMany(() => UniversityCampuses, (uc) => uc.university)
  campuses: UniversityCampuses;

  @ManyToOne(() => Destination, (destination) => destination.universities)
  destination: Destination;

  @Column({ default: false })
  isEnglishCourseAvailable: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  createdAt: Date;

  @ManyToMany(() => Course, (course) => course.universities)
  courses: Course[];

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
  updatedUniversity: Course;
}
