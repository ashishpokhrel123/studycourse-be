import { Module } from '@nestjs/common';
import { UniversityService } from '../service/university.service';
import { UniversityController } from '../controller/university.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { University } from 'src/common/entities/university.entity';
import { UniversityRepository } from '../respository/universityRespository';
import { FinanceDetails } from 'src/common/entities/financeDetails-university.entity';
import { Destination } from 'src/common/entities/destination.entity';
import { Course } from 'src/common/entities/course.entity';
import { Subject } from 'src/common/entities/subject.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([University, FinanceDetails, Destination, Course, Subject]),
  ],
  controllers: [UniversityController],
  providers: [UniversityService, UniversityRepository],
})
export class UniversityModule {}
