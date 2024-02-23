import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Course } from './course.entity';
import { University } from './university.entity';

@Entity()
export class Whitelist {
 @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; 

  @ManyToMany(() => Course, {nullable:true})
  @JoinTable()
  courses: Course[];

  @ManyToMany(() => University, {nullable:true})
  @JoinTable()
  university: University[];
}
