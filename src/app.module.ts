import { Module } from '@nestjs/common';
import { AuthModule } from './auth/module/auth.module';
import { UserModule } from './app/user/module/user.module';
import { CourseModule } from './app/course/module/course.module';
import { UniversityModule } from './app/university/module/university.module';
import { TypeOrmModule } from '@nestjs/typeorm';


import { Course } from './common/entities/course.entity';
import { University } from './common/entities/university.entity';
import { databaseConfigService } from './database/database-config.service.ts';
import { ScUser } from './common/entities/user.entity';
import { StudyLevelModule } from './app/study-level/module/study-level.module';
import { DestinationModule } from './app/destination/module/destination.module';
import { BlogModule } from './app/blog/module/blog.module';
import { FileUploadModule } from './app/FileUpload/file-upload-module';


@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfigService.getTypeOrmConfig()),
    AuthModule,
    UserModule,
    CourseModule,
    UniversityModule,
    TypeOrmModule.forFeature([
    ScUser,
    Course,
    University
    ]),
    StudyLevelModule,
    DestinationModule,
    BlogModule,
    FileUploadModule
  ],
 
})
export class AppModule {}
