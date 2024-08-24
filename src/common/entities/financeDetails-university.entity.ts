import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { University } from './university.entity';
import { Course } from './course.entity';


@Entity()
export class FinanceDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tuitionFee: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  financialAidAvailable: boolean;

  @Column({ nullable: true })
  scholarshipDetails: string;

  @ManyToOne(() => University, university => university.financeDetails)
  university: University;

  @ManyToOne(() => Course, course => course.financeDetails)
  course: Course;
  
  @Column({ nullable: true, type: 'timestamptz' })
  createdAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true, type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

}
