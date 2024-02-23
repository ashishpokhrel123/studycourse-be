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
import { Subject } from 'src/common/entities/subject.entity';
import slugify from 'slugify';

@Injectable()
export class CourseRepository {
  private readonly defaultLogger = new DefaultLogger(CourseRepository.name);
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly studyLevelRepository: StudyLevelRepository,
  ) {}

  async createCourse({
    courseName,
    slug,
    description,
    levelName,
    levelDescription,
    otherDescription,
    subjectName,
    subjectDescription,
  }): Promise<any> {
    try {
      const createdCourse = this.courseRepository.create({
        courseName,
        slug,
        description,
        createdAt: new Date(),
      });
      const studyLevel =
        await this.studyLevelRepository.fetchStudyLevelByFields({
          data: levelName,
        });
      if (!studyLevel) {
        const newStudyLevel = await this.studyLevelRepository.createStudyLevel({
          name: levelName,
          slug: slugify(levelName.toLowerCase()),
          description: levelDescription,
          otherDescription,
        });
        createdCourse.studyLevel = newStudyLevel;
      } else {
        createdCourse.studyLevel = studyLevel;
      }
      const savedCourse = await this.courseRepository.save(createdCourse);
      if (savedCourse) {
        let subject = await this.subjectRepository.findOne({
          where: { subjectName },
        });
        if (!subject) {
          const newSubject = await this.subjectRepository.create({
            subjectName,
            description: subjectDescription,
            course: savedCourse,
          });
          subject = newSubject;
        } else {
          subject.course = savedCourse;
          await this.subjectRepository.save(subject);
        }
      }
      return {
        status: HttpStatus.OK,
        message: 'Course created successfully',
      };
    } catch (error) {
      this.defaultLogger.log(error);
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCourse(course: UpdateCourseDto): Promise<any> {
    const createdCourse = this.courseRepository.create(course);
    return await this.courseRepository.save(createdCourse);
  }

  async fetchCourse(): Promise<any> {
    return this.courseRepository.find({ relations:["subject"]});
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
        .leftJoinAndSelect('course.subject', 'subject')
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
        .leftJoinAndSelect('course.subject', 'subject')
        .leftJoinAndSelect('course.universities', 'university')
        .leftJoinAndSelect('university.destination', 'destination')
         .leftJoinAndSelect('university.financeDetails', 'financeDetails')
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
      queryBuilder = queryBuilder.innerJoinAndSelect('course.universities', 'university');
    }

    // Filter by university
    if (universityId) {
      queryBuilder = queryBuilder.andWhere('university.id = :uid', { uid: universityId });
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

}
