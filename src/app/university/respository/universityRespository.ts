import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  getConnection,
  getRepository,
  Repository,
  In,
  createConnection,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { University } from 'src/common/entities/university.entity';
import {
  FinanceDetailsDto,
  UpdateUniversityDto,
} from '../dto/update-university.dto';
import { CreateUniversityDto } from '../dto/create-university.dto';
import { Destination } from 'src/common/entities/destination';
import { FinanceDetails } from 'src/common/entities/financeDetails-university.entity';
import { Course } from 'src/common/entities/course.entity';
import { Subject } from 'src/common/entities/subject.entity';

@Injectable()
export class UniversityRepository {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
    @InjectRepository(FinanceDetails)
    private readonly financeDetailsRepository: Repository<FinanceDetails>,

    @InjectRepository(Destination)
    private readonly studyDestinationRepository: Repository<Destination>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async createUniversity(
    createUniversityDto: CreateUniversityDto,
  ): Promise<{ status: number; message: string | HttpException }> {
    const { destination, financeDetails, courses, ...universityData } =
      createUniversityDto;

    // Check for existing university with name
    const existingUniversityWithName = await this.universityRepository
      .createQueryBuilder('university')
      .where('university.universityName=:uniName', {
        uniName: universityData.universityName,
      })
      .getOne();

    if (existingUniversityWithName) {
      throw new HttpException(
        'University  with name  already exists',
        HttpStatus.CONFLICT,
      );
    }

    // Fetch the destination
    const fetchDestination = await this.studyDestinationRepository.findOne({
      where: { id: destination },
    });
    if (!fetchDestination) {
      throw new Error('Destination not found');
    }

    // Create the University entity
    const university = await this.universityRepository.create({
      universityName: universityData.universityName,
      universityAddress: universityData.universityAddress,
      universityContactNumber: universityData.universityContactNumber,
      universityEmail: universityData.universityEmail,
      slug: universityData.slug,
      description: universityData.description,
      worldRanking: universityData.worldRanking,
      countryRanking: universityData.countryRanking,
      universityImage: universityData?.universityImage,
      createdAt: new Date(),
      destination: fetchDestination,
    });

    // Save the University entity
    const savedUniversity = await this.universityRepository.save(university);

    // Create and associate the FinanceDetails entity
    const financeDetailsEntity = this.financeDetailsRepository.create({
      ...financeDetails,
      university: savedUniversity,
    });
    await this.financeDetailsRepository.save(financeDetailsEntity);

    // Add courses to the University

    const fetchedCourses = [];
    courses.forEach(async (courseItem: any) => {
      const courseId = courseItem.courseId;
      const fetchedCourse = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      if (!fetchedCourse) {
        throw new Error(`Course with ID ${courseId} not found`);
      }
      fetchedCourses.push(fetchedCourse);
    });

    savedUniversity.courses = fetchedCourses;

    await this.universityRepository.save(savedUniversity);

    return {
      status: HttpStatus.CREATED,
      message: 'University created successfully',
    };
  }

  async updateUniversity({
    id,
    universityName,
    universityAddress,
    universityContactNumber,
    description,
    universityEmail,
    universityImage,
    worldRanking,
    countryRanking,
    financeDetails,
    destination,
    courses,
  }): Promise<{ status: number; message: string | HttpException }> {
    try {
      const university = await this.getUniversityByIdWithRelations(id);

      this.updateUniversityFields(university, {
        universityName,
        universityAddress,
        universityContactNumber,
        description,
        universityEmail,
        universityImage,
        worldRanking,
        countryRanking,
        destination,
      });

      if (financeDetails) {
        await this.updateFinanceDetails(university, financeDetails);
      }

      if (courses) {
        const existingCourseIds = university.courses.map((course) => course.id);
        const courseIdsInPayload = courses.map((courseItem) => courseItem);

        // Determine courses to be added
        const coursesToAdd = courses.filter(
          (courseItem) => !existingCourseIds.includes(courseItem),
        );

        // Determine courses to be removed
        const coursesToRemove = university.courses.filter(
          (course) => !courseIdsInPayload.includes(course.id),
        );

        console.log(coursesToRemove, 'remove');

        // Remove courses with specified IDs from each university
        university.courses = university.courses.filter(
          (course) => !coursesToRemove.some((c) => c.id === course.id),
        );

        // Save the changes to the database if needed
        await this.universityRepository.save(university);

        // Add courses to university
        for (const courseItem of coursesToAdd) {
          const fetchedCourse = await this.courseRepository.findOne({
            where: { id: courseItem },
          });
          if (!fetchedCourse) {
            throw new Error(`Course with ID ${courseItem} not found`);
          }
          university.courses.push(fetchedCourse);
        }
      }

      const updatedUniversity = await this.universityRepository.save(
        university,
      );

      return {
        status: HttpStatus.OK,
        message: 'University updated successfully',
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getUniversityByIdWithRelations(id: string): Promise<University> {
    const university = await this.universityRepository.findOne({
      where: { id },
      relations: ['courses', 'destination'],
    });
    if (!university) {
      throw new HttpException('University not found', HttpStatus.NOT_FOUND);
    }
    return university;
  }

  updateUniversityFields(university: University, updateData: any): void {
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        university[key] = value;
      }
    }
  }

  // async updateUniversityCourses(
  //   university: University,
  //   courses: any[],
  // ): Promise<void> {
  //   console.log(university, 'university');
  //   console.log(courses, 'courses');
  //   const courseIdsInPayload = courses.map((courseItem) => courseItem);

  //   const existingCourseIds = university.courses.map((course) => course.id);
  //   console.log(existingCourseIds, 'exisintggg');

  //   // Determine courses to be added
  //   const coursesToAdd = courses.filter(
  //     (courseItem) => !existingCourseIds.includes(courseItem),
  //   );
  //   console.log(coursesToAdd, 'add');

  //   // Determine courses to be removed
  //   const coursesToRemove = university.courses.filter(
  //     (course) => !courseIdsInPayload.includes(course.id),
  //   );

  //   try {
  //     // Start a transaction

  //     // Add courses to university
  //     for (const courseItem of coursesToAdd) {
  //       const course = await this.universityRepository.save(
  //         courseItem.courseId,
  //       );
  //       university.courses.push(course);
  //     }

  //     // Remove courses from university
  //     for (const course of coursesToRemove) {
  //       await this.universityRepository
  //         .createQueryBuilder()
  //         .delete()
  //         .from('course_universities_university')
  //         .where('courseId = :courseId', { courseId: course })
  //         .execute();
  //     }

  //     // Save the university
  //     await this.universityRepository.save(university);
  //   } catch (error) {
  //     throw new Error('Failed to update university courses');
  //   }
  // }

  private async updateFinanceDetails(
    university: University,
    financeDetails: FinanceDetailsDto,
  ): Promise<void> {
    // Fetch finance details entity
    let financeDetailsEntity = await this.financeDetailsRepository.findOne({
      where: { university },
    });
    if (!financeDetailsEntity) {
      financeDetailsEntity = new FinanceDetails();
    }

    // Update finance details entity
    Object.assign(financeDetailsEntity, financeDetails);

    // Save finance details entity
    await this.financeDetailsRepository.save(financeDetailsEntity);
  }

  // private async updateUniversityCourses(
  //   university: University,
  //   course: string
  // ): Promise<void> {
  //   try {
  //     // Fetch course by ID
  //     const course = await this.courseRepository.findOne({where: { id: course.value}});
  //     console.log(course, "courses")

  //     // If course not found, throw an error
  //     if (!course) {
  //       throw new Error(`Course with the provided ID not found`);
  //     }

  //     // Update the courses of the university
  //     university.courses = [course];

  //     // Save the updated university
  //     await this.universityRepository.save(university);
  //   } catch (error) {
  //     console.log(error);
  //     throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  async fetchUniversity(): Promise<University[]> {
    return this.universityRepository.find();
  }

  async fetchUniversityBySlug({ slug }: any): Promise<University | null> {
    try {
      const university = await this.universityRepository
        .createQueryBuilder('university')
        .leftJoinAndSelect('university.financeDetails', 'financeDetails')
        .leftJoinAndSelect('university.courses', 'course')
        .leftJoinAndSelect('course.studyLevel', 'studyLevel')
        .where('university.slug = :slug', { slug })
        .getOne();

      return university;
    } catch (error) {
      console.error('Error fetching university by slug:', error);
      return null;
    }
  }

  async fetchUniversityById({ id }): Promise<any | undefined> {
    const university = await this.universityRepository
      .createQueryBuilder('university')
      .leftJoinAndSelect('university.destination', 'destination')
      .leftJoinAndSelect('university.financeDetails', 'financeDetails')
      .leftJoinAndSelect('university.courses', 'courses')
      .leftJoinAndSelect('courses.studyLevel', 'studyLevel')
      .where('university.id = :id', { id })
      .getOne();

    // Fetch subjects based on the university's courses and study levels
    const subjects = await this.subjectRepository
      .createQueryBuilder('subject')
      .leftJoinAndSelect('subject.course', 'course')
      .leftJoin('course.studyLevel', 'studyLevel')
      .leftJoin('course.universities', 'uni')
      .where('uni.id = :id', { id })
      .getMany();

    return { university, subjects };
  }

  async searchUniversity({
    course,
    level,
    location,
    rankingOrder,
    feesOrder,
    scholarship,
  }): Promise<University[]> {
    try {
      let query = this.universityRepository
        .createQueryBuilder('university')
        .leftJoinAndSelect('university.courses', 'course')
        .leftJoinAndSelect('course.studyLevel', 'studyLevel')
        .leftJoinAndSelect('university.destination', 'destination')
        .leftJoinAndSelect('university.financeDetails', 'financeDetails');

      if (course) {
        query.andWhere('course.id = :courseId', { courseId: course });
      }

      if (level) {
        query.andWhere('studyLevel.id = :studyLevelId', {
          studyLevelId: level,
        });
      }

      if (location) {
        query.andWhere('destination.id = :destinationId', {
          destinationId: location,
        });
      }

      if (feesOrder) {
        if (feesOrder === 'ASC') {
          query
            .andWhere('financeDetails.tuitionFee IS NOT NULL')
            .orderBy('financeDetails.tuitionFee', 'ASC');
        } else if (feesOrder === 'DESC') {
          query
            .andWhere('financeDetails.tuitionFee IS NOT NULL')
            .orderBy('financeDetails.tuitionFee', 'DESC');
        }
      }

      if (scholarship) {
        if (scholarship === 'true') {
          query.andWhere('financeDetails.scholarshipDetails = true');
        } else if (scholarship === 'false') {
          query.andWhere('financeDetails.scholarshipDetails = false');
        }
      }

      if (rankingOrder) {
        query.orderBy('university.worldRanking', rankingOrder);
      }

      const universities = await query.getMany();

      console.log(universities, 'uni');
      return universities;
    } catch (error) {
      console.error('Error fetching universities:', error);
      throw new Error('Failed to fetch universities');
    }
  }

  async fetchUniversityByCourse({
    course,
    destination,
  }): Promise<University[] | null> {
    try {
      const courseRecord = await this.courseRepository.findOne({
        where: { slug: course },
      });

      if (!courseRecord) return null;

      let query = this.universityRepository
        .createQueryBuilder('university')
        .leftJoinAndSelect('university.destination', 'destination')
        .innerJoinAndSelect('university.courses', 'course')
        .where('course.id = :courseId', { courseId: courseRecord.id });

      if (destination) {
        query = query.andWhere('destination.id = :destinationId', {
          destinationId: destination,
        });
      }

      const universities = await query.getMany();

      return universities;
    } catch (error) {
      console.error('Error fetching universities by course:', error);
      return null;
    }
  }

  async fetchUniversitiesByIds(ids: string[]): Promise<any[] | undefined> {
    console.log(ids, 'ids');
    const universities = await this.universityRepository
      .createQueryBuilder('university')
      .leftJoinAndSelect('university.destination', 'destination')
      .leftJoinAndSelect('university.financeDetails', 'financeDetails')
      .leftJoinAndSelect('university.courses', 'courses')
      .leftJoinAndSelect('courses.studyLevel', 'studyLevel')
      .whereInIds(ids)
      .getMany();
    return universities;
  }
}
