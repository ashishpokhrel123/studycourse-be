import { Module } from '@nestjs/common';
import { UniversityService } from '../service/university.service';
import { UniversityController } from '../controller/university.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { University } from 'src/common/entities/university.entity';
import { UniversityRepository } from '../respository/universityRespository';
import { Destination } from 'src/common/entities/destination';
import { Course } from 'src/common/entities/course.entity';
import { UniversityCampuses } from 'src/common/entities/university-campuses.entity';
import { UniversityCourseSubject } from 'src/common/entities/university-course-subject.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([University, Destination, Course, UniversityCampuses, UniversityCourseSubject]),
  ],
  controllers: [UniversityController],
  providers: [UniversityService, UniversityRepository],
})
export class UniversityModule {}
