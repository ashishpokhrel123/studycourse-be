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
import {
  CreateCourseDto,
  StudyLevelDTO,
  SubjectDTO,
} from '../dto/create-course.dto';
import { StudyLevel } from 'src/common/entities/studyLevel.entity';

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

  async createCourse(courseDto: CreateCourseDto): Promise<any> {
    try {
      const { courseName, description, levels, subjects } = courseDto;

      // Create a new course
      const courseSlug = slugify(courseName.toLowerCase());
      const createdCourse = await this.courseRepository.create({
        courseName,
        slug: courseSlug,
        description,
        createdAt: new Date(),
      });

      // Fetch or create study level
      const studyLevel = await this.fetchOrCreateStudyLevel(levels);

      // Associate study level with the created course
      createdCourse.studyLevel = studyLevel;

      // Save the course
      const savedCourse = await this.courseRepository.save(createdCourse);

      // Create or update subjects
      await this.createOrUpdateSubjects(subjects, savedCourse);

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

private async createOrUpdateSubjects(subjects: any[], course: Course): Promise<void> {
  console.log(subjects, "subjects")
  for (const subjectDto of subjects) {
    let subject = await this.subjectRepository.findOne({ where: { subjectName: subjectDto.subjectName }});

    if (!subject) {
      subject = await this.createSubject(subjectDto, course);
    } else {
      this.updateSubject(subject, subjectDto, course);
    }

    await this.subjectRepository.save(subject);
  }
}

private async createSubject(subjectDto: any, course: Course): Promise<Subject> {
  console.log(subjectDto, "subjectDto")
  return this.subjectRepository.create({
    subjectName: subjectDto.subjectName,
    description: subjectDto.description,
    course: course
  });
}

private updateSubject(subject: Subject, subjectDto: any, course: Course): void {
  console.log(subject, 'subj')
  subject.description = subjectDto.subjectName;
  subject.description = subjectDto.description;
  subject.course = course;
}



  async updateCourse({
    id,
    courseName,
    description,
    levels,
    subjects,
  }): Promise<any> {
    try {
      const existingCourse = await this.courseRepository.findOne({where: {id}});

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

      // Fetch or create study level
      if (levels) {
        const studyLevel = await this.fetchOrCreateStudyLevel(levels);
        existingCourse.studyLevel = studyLevel;
      }

      // Save the updated course
      const updatedCourse = await this.courseRepository.save(existingCourse);

      // Create or update subjects
      if (subjects) {
        console.log(subjects, "main")
        await this.createOrUpdateSubjects(subjects, updatedCourse);
      }

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
    return this.courseRepository.find({ relations: ['subject'] });
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
}
