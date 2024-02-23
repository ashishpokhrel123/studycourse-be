import { Module } from '@nestjs/common';
import { CourseService } from '../service/course.service';
import { CourseController } from '../controller/course.controller';
import { CourseRepository } from '../respository/courseRespository';
import { StudyLevelRepository } from 'src/app/study-level/respository/studyLevel.respository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/common/entities/course.entity';
import { StudyLevel } from 'src/common/entities/studyLevel.entity';
import { Subject } from 'src/common/entities/subject.entity';
import { SubjectRepository } from 'src/app/subject/respository/subjectRepositiry';

@Module({
   imports: [
    TypeOrmModule.forFeature([Course, StudyLevel, Subject]),
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository, StudyLevelRepository, SubjectRepository]
})
export class CourseModule {}
