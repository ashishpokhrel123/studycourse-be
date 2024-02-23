import { Module } from '@nestjs/common';
import { BlogService } from '../service/blog.service';
import { BlogController } from '../controller/blog.controller';
import { BlogRepository } from '../respository/blog.respository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from 'src/common/entities/blog.entity';
import { ScUser } from 'src/common/entities/user.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([Blog, ScUser]),
  ],
  controllers: [BlogController],
  providers: [BlogService, BlogRepository],
})
export class BlogModule {}
