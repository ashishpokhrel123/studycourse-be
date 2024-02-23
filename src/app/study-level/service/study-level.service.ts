import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { StudyLevelRepository } from '../respository/studyLevel.respository';
import { StudyLevelDTO } from '../dto/create-study-level.dto';
import { StudyLevelUpdateDTO } from '../dto/update-study-level.dto';

@Injectable()
export class StudyLevelService {
  constructor(private readonly studyLevelRepository: StudyLevelRepository) {}

  async createStudyLevel(level: StudyLevelDTO): Promise<any> {
    try {
      const { name, slug, description, otherDescription } = level;

      if (isEmpty(name) || isEmpty(slug))
        throw new HttpException(
          'All fields  are required.',
          HttpStatus.BAD_REQUEST,
        );
      const newStudyLevel = await this.studyLevelRepository.createStudyLevel({
        name,
        slug,
        description,
        otherDescription,
      });
      return newStudyLevel;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateStudyLevel(level: StudyLevelUpdateDTO): Promise<any> {
    try {
      const { id, name, slug, description, otherDescription } = level;
      const updatedStudyLevel =
        await this.studyLevelRepository.updateStudyLevel({
          id,
          name,
          slug,
          description,
          otherDescription,
        });
      return updatedStudyLevel;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getStudyLevel(): Promise<any> {
    try {
      const studyLevel = await this.studyLevelRepository.fetchStudyLevel();
      return studyLevel;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getStudyLevelBySlug(slug: string): Promise<any> {
    try {
      if (isEmpty(slug))
        throw new HttpException(
          'Slug parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.studyLevelRepository.fetchStudyLevelBySlug(slug);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
