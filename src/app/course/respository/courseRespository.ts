import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger as DefaultLogger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/common/entities/course.entity';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { StudyLevelRepository } from 'src/app/study-level/respository/studyLevel.respository';
import slugify from 'slugify';
import {
  CourseCategoryDTO,
  CreateCourseDto,
  StudyLevelDTO,
  SubjectDTO,
} from '../dto/create-course.dto';
import { StudyLevel } from 'src/common/entities/studyLevel.entity';
import { CourseCategory } from 'src/common/entities/course-category';

@Injectable()
export class CourseRepository {
  private readonly defaultLogger = new DefaultLogger(CourseRepository.name);
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly studyLevelRepository: StudyLevelRepository,

    @InjectRepository(CourseCategory)
    private readonly courseCategoryRepository: Repository<CourseCategory>,
  ) {}

  async createCourse(courseDto: CreateCourseDto): Promise<any> {
    try {
      const { courseName, description, levels, category } = courseDto;

      // Create a new course
      const courseSlug = slugify(courseName.toLowerCase());
      const createdCourse = await this.courseRepository.create({
        courseName,
        slug: courseSlug,
        description,
        createdAt: new Date(),
      });

      // create or update course category
      const courseCategory = await this.fetchOrCreateCourseCategory(category);
      createdCourse.courseCategory = courseCategory;

      // Fetch or create study level
      const studyLevel = await this.fetchOrCreateStudyLevel(levels);

      // Associate study level with the created course
      createdCourse.studyLevel = studyLevel;

      // Save the course
      const savedCourse = await this.courseRepository.save(createdCourse);

      // Create or update subjects
      // await this.createOrUpdateSubjects(subjects, savedCourse);

      return {
        status: HttpStatus.OK,
        message: 'Course created successfully',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async fetchOrCreateCourseCategory(
    category: CourseCategoryDTO,
  ): Promise<CourseCategory> {
    let existingCategory = await this.courseCategoryRepository.findOne({
      where: { courseCategory: category.courseCategory },
    });

    if (!existingCategory) {
      existingCategory = this.courseCategoryRepository.create({
        courseCategory: category.courseCategory,
        createdAt: new Date(),
      });
      await this.courseCategoryRepository.save(existingCategory);
    }

    return existingCategory;
  }

  private async fetchOrCreateStudyLevel(
    level: StudyLevelDTO,
  ): Promise<StudyLevel> {
    const slug = slugify(level.levelName.toLowerCase());

    // Check if a study level with the same name already exists
    let existingStudyLevel =
      await this.studyLevelRepository.fetchStudyLevelByName(level.levelName);

    // If the study level  exist, retrun
    if (existingStudyLevel) {
      console.log(existingStudyLevel, 'existingStudyLevel');
      return existingStudyLevel;
    }

    // If the study level doesn't exist, create a new one
    const newStudyLevelDto = new StudyLevel();
    newStudyLevelDto.name = level.levelName;
    newStudyLevelDto.slug = slug;
    newStudyLevelDto.description = level.levelDescription;
    newStudyLevelDto.otherDescription = level.levelOtherDescription;
    existingStudyLevel = await this.studyLevelRepository.createStudyLevel(
      newStudyLevelDto,
    );
    return existingStudyLevel;
  }

  // private async createOrUpdateSubjects(
  //   subjects: any[],
  //   course: Course,
  // ): Promise<void> {
  //   console.log(subjects, 'subjects');
  //   for (const subjectDto of subjects) {
  //     let subject = await this.subjectRepository.findOne({
  //       where: { subjectName: subjectDto.subjectName },
  //     });

  //     if (!subject) {
  //       subject = await this.createSubject(subjectDto, course);
  //     } else {
  //       this.updateSubject(subject, subjectDto, course);
  //     }

  //     await this.subjectRepository.save(subject);
  //   }
  // }

  // private async createSubject(
  //   subjectDto: any,
  //   course: Course,
  // ): Promise<Subject> {
  //   console.log(subjectDto, 'subjectDto');
  //   return this.subjectRepository.create({
  //     subjectName: subjectDto.subjectName,
  //     description: subjectDto.description,
  //     course: course,
  //   });
  // }

  // private updateSubject(
  //   subject: Subject,
  //   subjectDto: any,
  //   course: Course,
  // ): void {
  //   console.log(subject, 'subj');
  //   subject.description = subjectDto.subjectName;
  //   subject.description = subjectDto.description;
  //   subject.course = course;
  // }

  async updateCourse({
    id,
    courseName,
    description,
    levels,
    category,
  }): Promise<any> {
    try {
      const existingCourse = await this.courseRepository.findOne({
        where: { id },
      });

      if (!existingCourse) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }
      if (courseName) {
        existingCourse.courseName = courseName;
        existingCourse.slug = slugify(courseName.toLowerCase());
      }
      if (description) {
        existingCourse.description = description;
      }

      // Fetch or create course category
      if (category) {
        const courseCategory = await this.fetchOrCreateCourseCategory(category);
        existingCourse.courseCategory = courseCategory;
      }

      // Fetch or create study level
      if (levels) {
        const studyLevel = await this.fetchOrCreateStudyLevel(levels);
        console.log(studyLevel, 'sl');
        existingCourse.studyLevel = studyLevel;
      }

      // Save the updated course
      const updatedCourse = await this.courseRepository.save(existingCourse);

      // // Create or update subjects
      // if (subjects) {
      //   console.log(subjects, 'main');
      //   await this.createOrUpdateSubjects(subjects, updatedCourse);
      // }

      return {
        status: HttpStatus.CREATED,
        message: 'Course updated successfully',
        data: updatedCourse,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchCourse(): Promise<any> {
    return this.courseRepository.find();
  }

  async fetchCoursePublic(): Promise<any> {
    return this.courseRepository.find({
      where: { isActive: true },
    });
  }
  async fetchCourseBySlug({ slug }: any): Promise<any> {
    return this.courseRepository.findOne({ where: { slug } });
  }

  async fetchCourseById({ id }: any): Promise<any> {
    try {
      const course = await this.courseRepository
        .createQueryBuilder('course')
        .where('course.id = :id', { id })
        .leftJoinAndSelect('course.studyLevel', 'studyLevel')
        .leftJoinAndSelect('course.courseCategory', 'courseCategory')
        // .leftJoinAndSelect('course.subject', 'subject')
        .getOne();

      return course || null;
    } catch (error) {
      console.error('Error fetching course by id with relations:', error);
      return null;
    }
  }

  async fetchSubjectByCourse({ course }: any): Promise<any> {
    try {
      const subject = await this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.studyLevel', 'studyLevel')
        // .leftJoinAndSelect('course.subject', 'subject')
        .leftJoinAndSelect('course.universities', 'university')
        .leftJoinAndSelect('university.courseSubject', 'courseSubject')
        .leftJoinAndSelect('courseSubject.course', 'courses')
        .leftJoinAndSelect('courseSubject.subject', 'subject')
        .leftJoinAndSelect('courses.financeDetails', 'financeDetails')
        .where('course.slug = :course', { course })
        .getOne();
      console.log(subject, 'sub');

      return subject;
    } catch (error) {
      console.error('Error fetching subject by course:', error);
      return null;
    }
  }

  async fetchCourseByLevel({
    level,
    universityId,
    destination,
  }: {
    level: string;
    universityId?: string;
    destination?: string;
  }) {
    try {
      let queryBuilder = this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.studyLevel', 'studyLevel')
        .where('studyLevel.slug = :level', { level });

      // Filter by university if provided
      if (universityId || destination) {
        queryBuilder = queryBuilder.innerJoinAndSelect(
          'course.universities',
          'university',
        );
      }

      // Filter by university
      if (universityId) {
        queryBuilder = queryBuilder.andWhere('university.id = :uid', {
          uid: universityId,
        });
      }

      // Filter by destination if provided
      if (destination) {
        queryBuilder = queryBuilder
          .leftJoinAndSelect('university.destination', 'destination')
          .andWhere('destination.id = :did', { did: destination });
      }

      const courses = await queryBuilder.getMany();
      console.log(courses);
      return courses;
    } catch (error) {
      console.error('Failed to fetch courses by level:', error.message);
      throw new Error('Failed to fetch courses by level');
    }
  }

  async deleteCourseById(id: string): Promise<void> {
    try {
      const course = await this.courseRepository.findOne({ where: { id } });
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      const result = await this.courseRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException(
          'Failed to delete course',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStatusCourse(
    id: string,
  ): Promise<{ status: number; message: string }> {
    try {
      const course = await this.courseRepository.findOne({ where: { id } });
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }
      const reqCourse = {
        id: course.id,
        updatedAt: new Date(),
        isActive: !course.isActive,
      };
      await this.courseRepository.update(course.id, reqCourse);

      return { status: HttpStatus.OK, message: 'Course updated successfully' };
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchCourseCategories(): Promise<CourseCategory[]> {
    try {
      return await this.courseCategoryRepository.find();
    } catch (error) {
      console.error('Error fetching course categories:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async fetchCategoriesWithCourses(): Promise<any> {
    try {
      const categories = await this.courseCategoryRepository.find({
        relations: ['courses'], // Fetch related courses
      });
      return categories;
    } catch (error) {
      console.error('Error fetching categories with courses:', error);
      throw new HttpException(
        'Failed to fetch categories with courses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchCourseCategoryById(id: string): Promise<CourseCategory | null> {
    try {
      const courseCategory = await this.courseCategoryRepository.findOne({
        where: { id },
      });
      if (!courseCategory) {
        throw new HttpException(
          'Course category not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return courseCategory;
    } catch (error) {
      console.error('Error fetching course category:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCourseCategoryById(updateData: any): Promise<any> {
    const {id,  ...data} = updateData
    console.log(  updateData, "while updating  data")
    try {
      const courseCategory = await this.courseCategoryRepository.findOne({
        where: { id },
      });

      if (!courseCategory) {
        throw new HttpException(
          'Course category not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return await this.courseCategoryRepository.update(
        courseCategory?.id,
        data,
      );
    } catch (error) {
      console.error('Error updating course category:', error);

      // Throw appropriate HTTP exceptions
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
