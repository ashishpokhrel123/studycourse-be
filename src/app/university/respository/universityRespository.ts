import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  getConnection,
  getRepository,
  Repository,
  In,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { University } from 'src/common/entities/university.entity';
import {
  CampusesDto,
  FinanceDetailsDto,
  UpdateUniversityDto,
} from '../dto/update-university.dto';
import { CreateUniversityDto } from '../dto/create-university.dto';
import { Destination } from 'src/common/entities/destination';
import { FinanceDetails } from 'src/common/entities/financeDetails-university.entity';
import { UniversityCampuses } from 'src/common/entities/university-campuses.entity';
import { Course } from 'src/common/entities/course.entity';
import { Subject } from 'src/common/entities/subject.entity';
import { UniversityCourseSubject } from 'src/common/entities/university-course-subject.entity';

@Injectable()
export class UniversityRepository {
  constructor(
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
    @InjectRepository(FinanceDetails)
    private readonly financeDetailsRepository: Repository<FinanceDetails>,
    @InjectRepository(UniversityCampuses)
    private readonly universityCampusRepository: Repository<UniversityCampuses>,

    @InjectRepository(Destination)
    private readonly studyDestinationRepository: Repository<Destination>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(UniversityCourseSubject)
    private readonly universityCourseSubjectRepository: Repository<UniversityCourseSubject>,
  ) {}

  async createUniversity(
    createUniversityDto: CreateUniversityDto,
  ): Promise<{ status: number; message: string | HttpException }> {
    const { destination, campuses, courses, ...universityData } =
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
        'University with name already exists',
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
      slug: universityData.slug,
      description: universityData.description,
      worldRanking: universityData.worldRanking,
      // countryRanking: universityData.countryRanking,
      universityImage: universityData?.universityImage,
      createdAt: new Date(),
      destination: fetchDestination,
    });

    // Save the University entity
    const savedUniversity = await this.universityRepository.save(university);

    // Create and associate the campus entity
    const savedCampuses = await Promise.all(
      campuses.map(async (campus) => {
        const universityCampusEntity = this.universityCampusRepository.create({
          ...campus,
          university: savedUniversity,
        });
        return await this.universityCampusRepository.save(
          universityCampusEntity,
        );
      }),
    );

    // Add courses and subjects to the University
    const fetchedCourses = await Promise.all(
      courses.map(async (courseItem: any) => {
        const courseId = courseItem.courses;
        const fetchedCourse = await this.courseRepository.findOne({
          where: { id: courseId },
        });
        if (!fetchedCourse) {
          throw new Error(`Course with ID ${courseId} not found`);
        }

        const financeDetails = this.financeDetailsRepository.create({
          ...courseItem,
          university: savedUniversity,
          course: courseId,
        });
        await this.financeDetailsRepository.save(financeDetails);

        // Add subjects to the course
        const savedSubjects = await Promise.all(
          courseItem.subjects.map(async (subject: any) => {
            const subjectEntity = this.subjectRepository.create({
              subjectName: subject.subjectName,
              description: subject.description,
              course: courseId,
            });
            const savedSubject = await this.subjectRepository.save(
              subjectEntity,
            );

            const universityCourseSubject =
              this.universityCourseSubjectRepository.create({
                university: savedUniversity,
                course: fetchedCourse,
                subject: savedSubject,
              });

            await this.universityCourseSubjectRepository.save(
              universityCourseSubject,
            );

            return savedSubject;
          }),
        );

        return fetchedCourse;
      }),
    );

    savedUniversity.courses = fetchedCourses;

    await this.universityRepository.save(savedUniversity);

    return {
      status: HttpStatus.CREATED,
      message: 'University created successfully',
    };
  }

  // async updateUniversity({
  //   id,
  //   universityName,
  //   description,
  //   universityImage,
  //   worldRanking,
  //   countryRanking,
  //   campuses,
  //   destination,
  //   courses,
  // }): Promise<{ status: number; message: string | HttpException }> {
  //   try {
  //     const university = await this.getUniversityByIdWithRelations(id);

  //     this.updateUniversityFields(university, {
  //       universityName,
  //       description,
  //       universityImage,
  //       worldRanking,
  //       countryRanking,
  //       destination,
  //     });

  //     // if (financeDetails) {
  //     //   await this.updateFinanceDetails(university, financeDetails);
  //     // }

  //     if (campuses) {
  //       await this.updateUniversityCampus(university, campuses);
  //     }

  //     if (courses) {
  //       await this.updateUniversityCourses(university, courses);
  //     }

  //     const updatedUniversity = await this.universityRepository.save(
  //       university,
  //     );

  //     return {
  //       status: HttpStatus.OK,
  //       message: 'University updated successfully',
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     if (error instanceof HttpException) {
  //       throw error;
  //     } else {
  //       throw new HttpException(
  //         'Internal Server Error',
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     }
  //   }
  // }

async updateUniversity({
  id,
  universityName,
  description,
  universityImage,
  worldRanking,
  countryRanking,
  campuses,
  destination,
  courses,
}: any): Promise<{ status: number; message: string | HttpException }> {
  try {
    // Fetch the existing university
    const existingUniversity = await this.universityRepository.findOne({
      where: { id },
      relations: ['destination', 'campuses', 'courses', 'courseSubject', 'courseSubject.subject', 'courseSubject.course'],
    });

    if (!existingUniversity) {
      throw new HttpException('University not found', HttpStatus.NOT_FOUND);
    }

    // Check for existing university with new name
    if (universityName !== existingUniversity.universityName) {
      const existingUniversityWithName = await this.universityRepository
        .createQueryBuilder('university')
        .where('university.universityName = :uniName', { uniName: universityName })
        .getOne();

      if (existingUniversityWithName) {
        throw new HttpException('University with name already exists', HttpStatus.CONFLICT);
      }
    }

    // Fetch the destination
    const fetchDestination = await this.studyDestinationRepository.findOne({
      where: { id: destination.id },
    });
    if (!fetchDestination) {
      throw new Error('Destination not found');
    }

    // Update university entity
    existingUniversity.universityName = universityName;
    existingUniversity.description = description;
    existingUniversity.universityImage = universityImage;
    existingUniversity.worldRanking = worldRanking;
    // existingUniversity.countryRanking = countryRanking;
    existingUniversity.destination = fetchDestination;

    // Save the updated university entity
    const updatedUniversity = await this.universityRepository.save(existingUniversity);

    // Update campuses
    const existingCampuses = await this.universityCampusRepository.find({ where: { university: updatedUniversity } });
    const campusIdsToKeep = campuses.map((campus: any) => campus.id);
    const campusesToRemove = existingCampuses.filter((campus) => !campusIdsToKeep.includes(campus.id));

    await this.universityCampusRepository.remove(campusesToRemove);

    const updatedCampuses = await Promise.all(
      campuses.map(async (campus) => {
        const existingCampus = await this.universityCampusRepository.findOne({ where: { id: campus.id } });

        if (existingCampus) {
          // Update existing campus
          Object.assign(existingCampus, campus);
          return await this.universityCampusRepository.save(existingCampus);
        } else {
          // Create new campus
          const universityCampusEntity = this.universityCampusRepository.create({
            ...campus,
            university: updatedUniversity,
          });
          return await this.universityCampusRepository.save(universityCampusEntity);
        }
      }),
    );

    // Update courses and subjects
    const updatedCourses = await Promise.all(
      courses.map(async (courseItem: any) => {
        const courseId = courseItem.courses;
        const fetchedCourse = await this.courseRepository.findOne({
          where: { id: courseId },
          relations: ['subjects'],
        });
        if (!fetchedCourse) {
          throw new Error(`Course with ID ${courseId} not found`);
        }

        const existingFinanceDetails = await this.financeDetailsRepository.findOne({
          where: { university: updatedUniversity, course: fetchedCourse },
        });

        if (existingFinanceDetails) {
          // Update existing finance details
          Object.assign(existingFinanceDetails, {
            tuitionFee: courseItem.tuitionFee,
            currency: courseItem.currency,
            financialAidAvailable: courseItem.financialAidAvailable,
            scholarshipDetails: courseItem.scholarshipDetails,
          });
          await this.financeDetailsRepository.save(existingFinanceDetails);
        } else {
          // Create new finance details
          const financeDetails = this.financeDetailsRepository.create({
            tuitionFee: courseItem.tuitionFee,
            currency: courseItem.currency,
            financialAidAvailable: courseItem.financialAidAvailable,
            scholarshipDetails: courseItem.scholarshipDetails,
            university: updatedUniversity,
            course: fetchedCourse,
          });
          await this.financeDetailsRepository.save(financeDetails);
        }

        // Fetch subjects from UniversityCourseSubject table
        const existingSubjects = await this.universityCourseSubjectRepository.find({
          where: { course: fetchedCourse, university: updatedUniversity },
          relations: ['subject'],
        });

        const subjectNamesToKeep = courseItem.subjects.map((subject: any) => subject.subjectName);

        const updatedSubjects = await Promise.all(
          courseItem.subjects.map(async (subject: any) => {
            let existingSubject = await this.subjectRepository.findOne({
              where: { subjectName: subject.subjectName },
            });

            if (existingSubject) {
              // Update existing subject
              Object.assign(existingSubject, subject);
              existingSubject = await this.subjectRepository.save(existingSubject);
            } else {
              // Create new subject
              const subjectEntity = this.subjectRepository.create({
                subjectName: subject.subjectName,
                description: subject.description,
              });
              existingSubject = await this.subjectRepository.save(subjectEntity);
            }

            // Ensure UniversityCourseSubject exists
            let universityCourseSubject = await this.universityCourseSubjectRepository.findOne({
              where: { university: updatedUniversity, course: fetchedCourse, subject: existingSubject },
            });

            if (!universityCourseSubject) {
              universityCourseSubject = this.universityCourseSubjectRepository.create({
                university: updatedUniversity,
                course: fetchedCourse,
                subject: existingSubject,
              });
              await this.universityCourseSubjectRepository.save(universityCourseSubject);
            }

            return existingSubject;
          }),
        );

        // fetchedCourse.subjects = updatedSubjects;
        return this.courseRepository.save(fetchedCourse);
      }),
    );

    updatedUniversity.courses = updatedCourses;

    await this.universityRepository.save(updatedUniversity);

    return {
      status: HttpStatus.OK,
      message: 'University updated successfully',
    };
  } catch (error) {
    console.log(error);
    if (error instanceof HttpException) {
      throw error;
    } else {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
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

 

  private async updateUniversityCampus(
    university: University,
    campuses: UniversityCampuses[],
  ): Promise<void> {
    // Fetch existing campus entities for the university
    const existingCampusEntities = await this.universityCampusRepository.find({
      where: { university },
    });

    // Create a map for existing campus entities by their ID
    const existingCampusMap = new Map<string, UniversityCampuses>(
      existingCampusEntities.map((campus) => [campus.id, campus]),
    );

    // Track campus IDs that are processed
    const processedCampusIds = new Set<string>();

    // Update or add campus details
    for (const campus of campuses) {
      if (existingCampusMap.has(campus.id)) {
        // Update existing campus details
        const existingCampusEntity = existingCampusMap.get(campus.id)!;
        existingCampusEntity.location =
          campus.location ?? existingCampusEntity.location;
        existingCampusEntity.email = campus.email ?? existingCampusEntity.email;
        existingCampusEntity.contact =
          campus.contact ?? existingCampusEntity.contact;

        console.log(existingCampusEntity, 'existing campus entity');

        // Save the updated campus details
        await this.universityCampusRepository.save(existingCampusEntity);

        // Mark the campus ID as processed
        processedCampusIds.add(campus.id);
      } else {
        // Add new campus details
        const newCampusEntity = this.universityCampusRepository.create({
          university,
          location: campus.location,
          email: campus.email,
          contact: campus.contact,
        });

        console.log(newCampusEntity, 'new campus entity');

        // Save the new campus details
        await this.universityCampusRepository.save(newCampusEntity);
      }
    }

    // Remove campus entities that are not present in the request
    const unprocessedCampusIds = existingCampusEntities
      .filter((campus) => !processedCampusIds.has(campus.id))
      .map((campus) => campus.id);

    if (unprocessedCampusIds.length > 0) {
      await this.universityCampusRepository.delete(unprocessedCampusIds);
    }
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

  async fetchUniversityPublic(): Promise<University[]> {
    return this.universityRepository.find({ where: { isActive: true } });
  }

 async fetchUniversityBySlug({ slug }: any): Promise<University | null> {
  try {
    const university = await this.universityRepository
      .createQueryBuilder('university')
      .leftJoinAndSelect('university.campuses', 'campuses')
      .leftJoinAndSelect('university.courseSubject', 'courseSubject') // Fetch university's subjects
      .leftJoinAndSelect('courseSubject.subject', 'subject') // Fetch subject details
      .leftJoinAndSelect('university.courses', 'course')
      .leftJoinAndSelect('course.universityCourseSubject', 'courseCourseSubject') // Fetch course-related subjects
      .leftJoinAndSelect('courseCourseSubject.subject', 'courseSubjectDetail') // Fetch subject details for each course
      .leftJoinAndSelect('course.financeDetails', 'financeDetails')
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
      .leftJoinAndSelect('university.campuses', 'campuses')
      .leftJoinAndSelect('university.courses', 'courses')
      .leftJoinAndSelect('courses.financeDetails', 'financeDetails')
      .leftJoinAndSelect('courses.studyLevel', 'studyLevel')
      .leftJoinAndSelect(
        'courses.universityCourseSubject',
        'universityCourseSubject',
      )
      .leftJoinAndSelect('universityCourseSubject.subject', 'subject')
      .where('university.id = :id', { id })
      .getOne();

    if (!university) {
      throw new Error(`University with ID ${id} not found`);
    }

    return { university };
  }

  async searchUniversity({
    course,
    level,
    location,
    rankingOrder,
    feesOrder,
    scholarship,
    courseCategory
  }): Promise<University[]> {
    try {
      let query = this.universityRepository
        .createQueryBuilder('university')
        .leftJoinAndSelect('university.courses', 'course')
        .leftJoinAndSelect('course.studyLevel', 'studyLevel')
        .leftJoinAndSelect('course.courseCategory', 'courseCategory')
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
        if (scholarship === 'yes') {
          query.andWhere('financeDetails.scholarshipDetails = yes');
        } else if (scholarship === 'no') {
          query.andWhere('financeDetails.scholarshipDetails = no');
        }
      }

      if (rankingOrder) {
        query.orderBy('university.worldRanking', rankingOrder);
      }

       if (courseCategory) {
      query.andWhere('courseCategory.id = :courseCategoryId', {
        courseCategoryId: courseCategory,
      });
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
        .innerJoinAndSelect('course.subject', 'subject')
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

  async updateStatusUniversity(
    id: string,
  ): Promise<{ status: number; message: string }> {
    try {
      console.log(id, 'id');
      const university = await this.universityRepository.findOne({
        where: { id },
      });
      if (!university) {
        throw new HttpException('University not found', HttpStatus.NOT_FOUND);
      }
      const reqUniversity = {
        id: university.id,
        updatedAt: new Date(),
        isActive: !university.isActive,
      };
      await this.courseRepository.update(university.id, reqUniversity);

      return {
        status: HttpStatus.OK,
        message: 'UNiversity updated successfully',
      };
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

  private async updateUniversityCourses(
    university: University,
    courses: any[],
  ): Promise<void> {
    const existingCourseIds = university.courses.map((course) => course.id);
    const courseIdsInPayload = courses.map((courseItem) => courseItem.courses);

    // Determine courses to be added
    const coursesToAdd = courses.filter(
      (courseItem) => !existingCourseIds.includes(courseItem.courses),
    );

    // Determine courses to be removed
    const coursesToRemove = university.courses.filter(
      (course) => !courseIdsInPayload.includes(course.id),
    );

    // Remove financial details associated with the courses to be removed
    await Promise.all(
      coursesToRemove.map(async (course) => {
        await this.financeDetailsRepository.delete({ course, university });
      }),
    );

    // Remove courses with specified IDs from the university
    university.courses = university.courses.filter(
      (course) => !coursesToRemove.some((c) => c.id === course.id),
    );

    // Add or update courses and finance details
    const fetchedCourses = await Promise.all(
      courses.map(async (courseItem) => {
        const courseId = courseItem.courses;
        const fetchedCourse = await this.courseRepository.findOne({
          where: { id: courseId },
        });
        if (!fetchedCourse) {
          throw new Error(`Course with ID ${courseId} not found`);
        }

        // Update or create finance details
        const financeDetails = this.financeDetailsRepository.create({
          ...courseItem,
          university,
          course: fetchedCourse,
        });
        await this.financeDetailsRepository.save(financeDetails);

        // Add subjects to the course, checking if they already exist
        const savedSubjects = await Promise.all(
          (courseItem.subjects || []).map(async (subject: any) => {
            // Check if subject already exists
            let savedSubject = await this.subjectRepository.findOne({
              where: {
                subjectName: subject.subjectName,
                description: subject.description,
                course: fetchedCourse,
              },
            });

            if (!savedSubject) {
              const subjectEntity = this.subjectRepository.create({
                subjectName: subject.subjectName,
                description: subject.description,
                course: fetchedCourse,
              });
              savedSubject = await this.subjectRepository.save(subjectEntity);
            }

            // Check if the university-course-subject relationship already exists
            let universityCourseSubject =
              await this.universityCourseSubjectRepository.findOne({
                where: {
                  university,
                  course: fetchedCourse,
                  subject: savedSubject,
                },
              });

            if (!universityCourseSubject) {
              universityCourseSubject =
                this.universityCourseSubjectRepository.create({
                  university,
                  course: fetchedCourse,
                  subject: savedSubject,
                });
              await this.universityCourseSubjectRepository.save(
                universityCourseSubject,
              );
            }

            return savedSubject;
          }),
        );

        // Remove subjects that are not in the payload
        const existingSubjects = await this.subjectRepository.find({
          where: { course: fetchedCourse },
        });

        const subjectsToRemove = existingSubjects.filter(
          (existingSubject) =>
            !courseItem.subjects.some(
              (subject: any) =>
                subject.subjectName === existingSubject.subjectName &&
                subject.description === existingSubject.description,
            ),
        );

        await Promise.all(
          subjectsToRemove.map(async (subjectToRemove) => {
            // Remove the relationship first
            await this.universityCourseSubjectRepository.delete({
              university,
              course: fetchedCourse,
              subject: subjectToRemove,
            });
            // Then remove the subject
            await this.subjectRepository.delete(subjectToRemove.id);
          }),
        );

        // Return fetched course to add to university's course list
        return fetchedCourse;
      }),
    );

    // Update university's courses with fetched courses
    university.courses.push(...fetchedCourses);
  }

   async fetchSubjectsByUniversity(id: string): Promise<any> {
    console.log(id)
    try {
      const university = await this.universityRepository.findOne({
        where: { id },
        relations: ['courseSubject'],
      });
      console.log(university, "university")

      if (!university) {
        throw new HttpException('University not found', HttpStatus.NOT_FOUND);
      }

     

      return  university ;
    } catch (error) {
      console.error('Error fetching subjects by university:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

