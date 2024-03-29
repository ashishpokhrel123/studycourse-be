import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CourseRepository } from '../respository/courseRespository';
import { isEmpty } from 'class-validator';
import slugify from 'slugify';
import { Course } from 'src/common/entities/course.entity';

@Injectable()
export class CourseService {
  constructor(private readonly courseRepository: CourseRepository) {}

  async createCourse(course: CreateCourseDto): Promise<any> {
    try {
      const { courseName, description, levelName, levelDescription, otherDescription, subjectName, subjectDescription } = course;

      if (isEmpty(courseName) || isEmpty(description) || isEmpty(levelName) || isEmpty(subjectName))
        throw new HttpException(
          'All fields  are required.',
          HttpStatus.BAD_REQUEST,
        );

      const newCourse = await this.courseRepository.createCourse({
        courseName,
        slug : slugify(courseName.toLowerCase()),
        description,
        levelName,
        levelDescription,
        otherDescription,
        subjectName,
        subjectDescription
      });
      return newCourse;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateCourse(course: UpdateCourseDto): Promise<any> {
    try {
      const { id, courseName, description } = course;
      const updatedCourse = await this.courseRepository.updateCourse({
        id,
        courseName,
        description,
      });
      return updatedCourse;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getCourses(): Promise<any> {
    try {
      const course = await this.courseRepository.fetchCourse();
      return course;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getCourseBySlug(slug: string): Promise<any> {
    try {
      if (isEmpty(slug))
        throw new HttpException(
          'Slug parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.courseRepository.fetchCourseBySlug(slug);
    } catch (error) {}
  }

   async getCourseById({id}): Promise<any> {
    try {
      if (isEmpty(id))
        throw new HttpException(
          'Id parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.courseRepository.fetchCourseById({id});
    } catch (error) {}
  }


  async getSubjectByCourse(course: string): Promise<any> {
    console.log(course,"cc")
    try {
      if (isEmpty(course))
        throw new HttpException(
          'Slug parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.courseRepository.fetchSubjectByCourse({course});
    } catch (error) {}
  }

   async getCourseByLevel({level,universityId, destination}): Promise<any> {
    try {
      if (isEmpty(level))
        throw new HttpException(
          'Level parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.courseRepository.fetchCourseByLevel({level, universityId, destination});
    } catch (error) {}
  }

  
}
