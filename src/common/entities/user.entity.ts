import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from './blog.entity';
import { StudyLevel } from './studyLevel.entity';
import { Destination } from './destination.entity';

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  STUDENT = 'student',
}
@Entity()
export class ScUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  lastName: string;

  @Column({
    unique: true,
    transformer: {
      to: (value) => value.toLowerCase(),
      from: (value) => value,
    },
  })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  nationality: string;

  @ManyToOne(() => StudyLevel, (level) => level.user, { nullable: true })
  studyLevel: StudyLevel;

  @ManyToOne(() => Destination, (dest) => dest.user, { nullable: true })
  destination: Destination;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender: UserGender;

  @Column({ nullable: true })
  photoPath: string;

  @OneToMany(() => Blog, (blogs) => blogs.author)
  blog: Blog;

  @Column({ nullable: true })
  counselingOption: string;

  @Column({ default: false })
  termsAndConditionsAccepted: boolean;

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

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  emailVerifiedAt: Date;
 // for google login
  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true, type: 'timestamptz' })
  lastActive: Date;
}
