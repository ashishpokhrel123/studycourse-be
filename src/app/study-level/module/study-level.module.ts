import { Module } from '@nestjs/common';
import { StudyLevelService } from '../service/study-level.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyLevel } from 'src/common/entities/studyLevel.entity';
import { StudyLevelRepository } from '../respository/studyLevel.respository';
import { StudyLevelController } from '../controller/studyLevel.controller';


@Module({
   imports: [
    TypeOrmModule.forFeature([StudyLevel]),
  ],
  controllers: [StudyLevelController],
  providers: [StudyLevelService, StudyLevelRepository],
})
export class StudyLevelModule {}
