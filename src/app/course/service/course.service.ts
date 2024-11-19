import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CourseRepository } from '../respository/courseRespository';
import { isEmpty } from 'class-validator';
import slugify from 'slugify';
import { Course } from 'src/common/entities/course.entity';
import { UpdateCourseCategoryDto } from '../dto/update-course-category.dto';

@Injectable()
export class CourseService {
  constructor(private readonly courseRepository: CourseRepository) {}

 async createCourse(course: CreateCourseDto): Promise<any> {
  try {
    const { courseName, description, levels,  category } = course;

    if (isEmpty(courseName) || isEmpty(description) || isEmpty(levels))
      throw new HttpException(
        'All fields are required.',
        HttpStatus.BAD_REQUEST,
      );

    const newCourse = await this.courseRepository.createCourse({
      courseName,
      description,
      levels: {
        levelName: levels.levelName,
        slug: slugify(levels.levelName?.toLowerCase()),
        levelDescription: levels.levelDescription ? levels.levelDescription : '',
        levelOtherDescription: levels.levelOtherDescription ? levels.levelOtherDescription : ''
      },

      category
    });
    return newCourse;
  } catch (error) {
    console.error(error);
    throw new HttpException(
      'Internal Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

  async updateCourse(course: UpdateCourseDto): Promise<any> {
    try {
      const { id, courseName, description, levels,  category } = course;
      const updatedCourse = await this.courseRepository.updateCourse({
        id,
        courseName,
        description,
        levels,
        category
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
   async getCoursesPublic(): Promise<any> {
    try {
      const course = await this.courseRepository.fetchCoursePublic();
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

  async deleteCourseById(id: string): Promise<void> {
    try {
      if (isEmpty(id))
        throw new HttpException(
          'Id parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      await this.courseRepository.deleteCourseById(id);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

    async updateStatusCourse(id: string): Promise<void> {
    try {
      if (isEmpty(id))
        throw new HttpException(
          'Id parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      await this.courseRepository.updateStatusCourse(id);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCourseCategories(): Promise<any> {
    try {
      const categories = await this.courseRepository.fetchCourseCategories();
      return categories;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

   async getCategoriesWithCourses(): Promise<any> {
    try {
      const categories = await this.courseRepository.fetchCategoriesWithCourses();
      return categories
    } catch (error) {
      throw new HttpException(
        'Failed to fetch categories with courses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCategoriesById(id:string): Promise<any> {
    try {
      const categories = await this.courseRepository.fetchCourseCategoryById(id);
      return categories
    } catch (error) {
      throw new HttpException(
        'Failed to fetch categories with courses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

   async updateCourseCategory(data:UpdateCourseCategoryDto): Promise<any> {
    try {
      const categories = await this.courseRepository.updateCourseCategoryById(data);
      return categories
    } catch (error) {
      throw new HttpException(
        'Failed to fetch categories with courses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}

  

