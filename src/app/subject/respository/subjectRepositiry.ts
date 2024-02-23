import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StudyLevel } from 'src/common/entities/studyLevel.entity';
import slugify from 'slugify';
import { Subject } from 'src/common/entities/subject.entity';
import { CreateSubjectDto } from '../dto/create-subject.dto';

@Injectable()
export class SubjectRepository {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

//  async createSubject(subject: CreateSubjectDto): Promise<any> {
//     const createdSubject = this.subjectRepository.create({
//         subjectName: subject.subjectName,
//         description: subject.description,
//         course: subject.course
//     });

//     return await this.subjectRepository.save(createdSubject);
// }


  async fetchSubjectByFields({
    data,
  }: {
    data: any;
  }): Promise<Subject | undefined> {
    return this.subjectRepository.findOne({ where: { subjectName: data } });
  }
}
