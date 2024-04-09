import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StudyLevel } from 'src/common/entities/studyLevel.entity';
import { StudyLevelDTO } from '../dto/create-study-level.dto';
import { StudyLevelUpdateDTO } from '../dto/update-study-level.dto';
import slugify from 'slugify';


@Injectable()
export class StudyLevelRepository {
  constructor(
    @InjectRepository(StudyLevel)
    private readonly studyLevelRepository: Repository<StudyLevel>,
  ) {}

  async createStudyLevel( level: StudyLevelDTO ): Promise<any> {
  const { name, description, otherDescription } = level;

  // Create the study level entity
  const createdStudyLevel = this.studyLevelRepository.create({
    name,
    slug: slugify(name.toLowerCase()),
    description,
    otherDescription,
    createdAt: new Date(),
  });

  // Save the study level entity
  return await this.studyLevelRepository.save(createdStudyLevel);
}


  async updateStudyLevel(level: StudyLevelUpdateDTO): Promise<any> {
    const updateStudyLevel = this.studyLevelRepository.create(level);
    return await this.studyLevelRepository.save(updateStudyLevel);
  }

  async fetchStudyLevel(): Promise<any> {
    return this.studyLevelRepository.find();
  }

  async fetchStudyLevelBySlug({ slug }: any): Promise<any> {
    return this.studyLevelRepository.findOne({where: { slug}});
  }

   async fetchStudyLevelByName({ name }: any): Promise<StudyLevel | undefined> {
    return this.studyLevelRepository.findOne({where: { name}});
  }

async fetchStudyLevelByField(fieldName: string, fieldValue: any): Promise<StudyLevel | undefined> {
  const query = { [fieldName]: fieldValue };
  return this.studyLevelRepository.findOne({ where: query });
}




}
