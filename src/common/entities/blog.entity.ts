import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ScUser } from './user.entity';


@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  metaTitle: string;

  @Column({ nullable: true })
  metaDescription: string;

  @Column()
  contents: string;

  @ManyToOne(() => ScUser, (author) => author.blog)
  author: ScUser;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  featuredBy: string;

  @Column({ default: 0 })
  totalViews: number;

  // @ManyToMany(() => BlogCategory, (blogCategory) => blogCategory.blogs)
  // @JoinTable()
  // categories: BlogCategory[];

  // @OneToMany(() => BlogFaq, (blogFaq) => blogFaq.blog)
  // blogFaq: BlogFaq;

  // @OneToMany(() => BlogComment, (blogComment) => blogComment.blog)
  // comment: BlogComment;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column()
  coverImage: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column('text', { nullable: true })
  schemaMarkup: string;

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

  @Column({ default: false })
  isDelete: boolean;
}
