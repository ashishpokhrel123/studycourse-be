import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getConnection, getRepository, Repository, In } from 'typeorm';
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

  async updateUniversity({
    id,
    universityName,
    description,
    universityImage,
    worldRanking,
    campuses,
    destination,
    courses,
  }: any): Promise<any> {
    let existingUniversity = await this.universityRepository.findOne({
      where: { id },
      relations: ['destination', 'campuses', 'courses', 'courseSubject'],
    });

    if (!existingUniversity)
      throw new HttpException('University not found', HttpStatus.NOT_FOUND);

    if (universityName !== existingUniversity.universityName) {
      const existingUniversityWithName = await this.universityRepository
        .createQueryBuilder('university')
        .where(
          'university.universityName = :uniName AND university.id != :id',
          {
            uniName: universityName,
            id,
          },
        )
        .getOne();

      if (existingUniversityWithName) {
        throw new HttpException(
          'University with this name already exists',
          HttpStatus.CONFLICT,
        );
      }
    }

    // Fetch the destination
    const fetchDestination = await this.studyDestinationRepository.findOne({
      where: { id: destination },
    });
    if (!fetchDestination) {
      throw new HttpException('Destination not found', HttpStatus.NOT_FOUND);
    }

    // Update university entity
    existingUniversity.universityName = universityName;
    existingUniversity.description = description;
    existingUniversity.universityImage = universityImage;
    existingUniversity.worldRanking = worldRanking;
    existingUniversity.destination = fetchDestination;

    // Update campuses
    const existingCampuses = await this.universityCampusRepository.find({
      where: { university: existingUniversity },
    });

    const campusIdsToKeep = campuses.map((campus) => campus.id).filter(Boolean);

    // Identify campuses to remove and remove them
    const campusesToRemove = existingCampuses.filter(
      (campus) => !campusIdsToKeep.includes(campus.id),
    );
    if (campusesToRemove.length) {
      await this.universityCampusRepository.remove(campusesToRemove);
    }

    // Update or create campuses based on the payload
    await Promise.all(
      campuses.map(async (campus) => {
        if (campus.id) {
          // Update existing campus
          const existingCampus = existingCampuses.find(
            (c) => c.id === campus.id,
          );
          if (existingCampus) {
            Object.assign(existingCampus, campus);
            try {
              await this.universityCampusRepository.save(existingCampus);
            } catch (error) {
              console.error('Error updating campus:', error);
            }
          } else {
            console.error('Campus ID exists but not found:', campus.id);
          }
        } else {
          // Create new campus
          try {
            await this.universityCampusRepository.save({
              ...campus,
              university: existingUniversity,
            });
          } catch (error) {
            console.error('Error saving new campus:', error);
          }
        }
      }),
    );

    await Promise.all(
      courses.map(async (cou: any) => {
        const payloadCourseIds = courses
          .map((course) => course.course)
          .filter(Boolean);

        // Find existing courses linked to the university
        const existingCourses =
          await this.universityCourseSubjectRepository.find({
            where: { university: existingUniversity },
            relations: ['course', 'subject'],
          });

        // Extract existing course IDs
        const existingCourseIds = existingCourses.map(
          (unicourse) => unicourse.course.id,
        );

        // Identify courses to remove
        const coursesToRemove = existingCourses.filter(
          (unicourse) => !payloadCourseIds.includes(unicourse.course.id),
        );

        // Remove courses that are not in the payload
        if (coursesToRemove.length) {
          for (const courseToRemove of coursesToRemove) {
            // Delete related subjects first
            const relatedSubjects = await this.subjectRepository.find({
              where: { course: courseToRemove.course },
            });

            const finaceSubjects = await this.financeDetailsRepository.find({
              where: { course: courseToRemove.course },
            });

            if (relatedSubjects.length) {
              await this.subjectRepository.remove(relatedSubjects);
            }

            if (finaceSubjects.length) {
              await this.financeDetailsRepository.remove(finaceSubjects);
            }

            // Now, remove the course
            await this.universityCourseSubjectRepository.delete({
              course: courseToRemove.course,
              university: existingUniversity,
            });
          }
        }

        if (cou.course) {
          const existingCourse = await this.courseRepository.findOne(
            cou.course,
          );
          const fetchUniCourse =
            await this.universityCourseSubjectRepository.find({
              where: { course: cou.course, university: existingUniversity },
              relations: ['subject'],
            });

          if (!fetchUniCourse.length) {
            throw new Error(`Course with ID ${cou.course} not found`);
          }

          const existingSubjects = fetchUniCourse.map(
            (unicourse) => unicourse.subject,
          );
          const payloadSubjectIds = cou.subjects
            .map((subject) => subject.id)
            .filter(Boolean);

          // Identify subjects to remove
          const subjectsToRemove = existingSubjects.filter(
            (subject) => !payloadSubjectIds.includes(subject.id),
          );

          // Remove subjects not present in payload
          if (subjectsToRemove.length) {
            await this.subjectRepository.remove(subjectsToRemove);
          }

          // Track processed subjects to avoid multiple updates
          const processedSubjectIds = new Set<number>();

          // Update existing subjects and add new ones
          await Promise.all(
            cou.subjects.map(async (subject: any) => {
              if (!processedSubjectIds.has(subject.id)) {
                const existingSubject = existingSubjects.find(
                  (sub) => sub.id === subject.id,
                );

                if (existingSubject) {
                  // Update existing subject
                  Object.assign(existingSubject, subject);
                  await this.subjectRepository.save(existingSubject);
                } else {
                  // Add new subject
                  const newSubject = this.subjectRepository.create({
                    subjectName: subject.subjectName,
                    description: subject.description,
                    course: existingCourse,
                  });
                  const savedSubject = await this.subjectRepository.save(
                    newSubject,
                  );

                  // Link new subject to university and course
                  await this.universityCourseSubjectRepository.save({
                    university: existingUniversity,
                    course: existingCourse,
                    subject: savedSubject,
                  });
                }

                // Mark the subject as processed
                processedSubjectIds.add(subject.id);
              }
            }),
          );
        } else {
          console.log(cou, '1');
          // console.log(courses[0].course, '2');
          // Adding a new course with finance details and subjects
          const isCourseExist = await this.courseRepository.findOne({
            where: { id: cou.courses },
          });
          console.log(isCourseExist, 'exist');
          if (isCourseExist) {
            await this.financeDetailsRepository.save({
              ...cou,
              university: existingUniversity,
              course: isCourseExist,
            });

            // Track processed subjects to avoid multiple updates
            const processedSubjectIds = new Set<number>();

            await Promise.all(
              cou.subjects.map(async (subject: any) => {
                if (!processedSubjectIds.has(subject.id)) {
                  const newSubject = this.subjectRepository.create({
                    subjectName: subject.subjectName,
                    description: subject.description,
                    course: isCourseExist,
                  });
                  const savedSubject = await this.subjectRepository.save(
                    newSubject,
                  );

                  // Link new subject to university and course
                  await this.universityCourseSubjectRepository.save({
                    university: existingUniversity,
                    course: isCourseExist,
                    subject: savedSubject,
                  });

                  // Mark the subject as processed
                  processedSubjectIds.add(subject.id);
                }
              }),
            );
          }
        }
      }),
    );
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

  async createAndSaveCampus(campus: any, existingUniversity: any) {
    try {
      const newUniversityCampus = this.universityCampusRepository.create({
        ...campus,
        university: existingUniversity,
      });

      console.log(newUniversityCampus, 'new campuses');

      const savedCampus = await this.universityCampusRepository.save(
        newUniversityCampus,
      );
      console.log(savedCampus, 'Campus saved successfully');

      return savedCampus;
    } catch (error) {
      console.error('Error saving campus:', error);
      throw new Error('Failed to save the campus');
    }
  }

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
        .leftJoinAndSelect(
          'course.universityCourseSubject',
          'courseCourseSubject',
        ) // Fetch course-related subjects
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

async  fetchUniversityById({ id }): Promise<any | undefined> {
  const university = await this.universityRepository
    .createQueryBuilder('university')
    .leftJoinAndSelect('university.destination', 'destination')
    .leftJoinAndSelect('university.campuses', 'campuses')
    .leftJoinAndSelect('university.courseSubject', 'universityCourseSubject')
    .leftJoinAndSelect('universityCourseSubject.course', 'course')
    .leftJoinAndSelect('course.financeDetails', 'financeDetails')
    .leftJoinAndSelect('universityCourseSubject.subject', 'subject')
    .where('university.id = :id', { id })
    .getOne();

  if (!university) {
    throw new Error(`University with ID ${id} not found`);
  }

  // Ensure university.courseSubject is an array
  const courseSubjects = Array.isArray(university.courseSubject) ? university.courseSubject : [];

  // Create a map to associate subjects with their corresponding courses
  const coursesMap = courseSubjects.reduce((acc, courseSubject) => {
    const courseId = courseSubject.course.id;

    // Initialize the course in the map if it doesn't exist
    if (!acc[courseId]) {
      acc[courseId] = {
        ...courseSubject.course,
        subjects: [],
      };
    }

    // Add the subject to the course
    acc[courseId].subjects.push(courseSubject.subject);

    return acc;
  }, {} as Record<string, { id: string; courseName: string; subjects: any[] }>);


  const coursesWithSubjects = Object.values(coursesMap);

  return {
    ...university,
    courseSubject: coursesWithSubjects,
  };
}


  async searchUniversity({
    course,
    level,
    location,
    rankingOrder,
    feesOrder,
    scholarship,
    courseCategory,
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

  async fetchSubjectsByUniversity(id: string): Promise<any> {
    console.log(id);
    try {
      const university = await this.universityRepository.findOne({
        where: { id },
        relations: ['courseSubject'],
      });
      console.log(university, 'university');

      if (!university) {
        throw new HttpException('University not found', HttpStatus.NOT_FOUND);
      }

      return university;
    } catch (error) {
      console.error('Error fetching subjects by university:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //  async updateCourses(courses: any[], existingUniversity: University) {
  //   await Promise.all(
  //     courses.map(async (courseItem: any) => {
  //       const course = await this.getOrCreateCourse(courseItem);

  //       await this.updateOrCreateFinanceDetails(course, courseItem, existingUniversity);

  //       const updatedSubjects = await Promise.all(
  //         courseItem.subjects.map(async (subjectItem: any) => {
  //           const subject = await this.updateOrCreateSubject(subjectItem);
  //           await this.ensureUniversityCourseSubject(existingUniversity, course, subject);
  //           return subject;
  //         })
  //       );

  //       // Assign subjects to course if needed
  //       // course.subjects = updatedSubjects;

  //       return this.courseRepository.save(course);
  //     })
  //   );
  // }

  // async getOrCreateCourse(courseItem: any, universityId: number) {
  //   const university = await this.universityRepository.findOne({
  //     where: { id: universityId.toString() },
  //     relations: ['courses'], // Ensure 'courses' is a valid relation in the University entity
  //   });

  //   if (!university) {
  //     throw new Error(`University with ID ${universityId} not found`);
  //   }

  //   let course = university.courses.find(c => c.id === courseItem.courseId);

  //   if (!course) {
  //     course = this.courseRepository.create({
  //       courseName: courseItem.courseName,
  //       university: university, // Associate the course with the university
  //     });
  //     course = await this.courseRepository.save(course);
  //   }

  //   return course;
  // }

  async updateOrCreateFinanceDetails(
    course: any,
    courseItem: any,
    existingUniversity: any,
  ) {
    let financeDetails = await this.financeDetailsRepository.findOne({
      where: { university: existingUniversity, course: course },
    });

    if (financeDetails) {
      Object.assign(financeDetails, {
        tuitionFee: courseItem.tuitionFee,
        currency: courseItem.currency,
        financialAidAvailable: courseItem.financialAidAvailable,
        scholarshipDetails: courseItem.scholarshipDetails,
      });
    } else {
      financeDetails = this.financeDetailsRepository.create({
        tuitionFee: courseItem.tuitionFee,
        currency: courseItem.currency,
        financialAidAvailable: courseItem.financialAidAvailable,
        scholarshipDetails: courseItem.scholarshipDetails,
        university: existingUniversity,
        course: course,
      });
    }

    return this.financeDetailsRepository.save(financeDetails);
  }

  async updateOrCreateSubject(subjectItem: any) {
    let subject = await this.subjectRepository.findOne({
      where: { subjectName: subjectItem.subjectName },
    });

    if (!subject) {
      subject = this.subjectRepository.create({
        subjectName: subjectItem.subjectName,
        description: subjectItem.description,
      });
    } else {
      Object.assign(subject, subjectItem);
    }

    return this.subjectRepository.save(subject);
  }

  async ensureUniversityCourseSubject(
    university: University,
    course: any,
    subject: any,
  ) {
    let universityCourseSubject =
      await this.universityCourseSubjectRepository.findOne({
        where: { university: university, course: course, subject: subject },
      });

    if (!universityCourseSubject) {
      universityCourseSubject = this.universityCourseSubjectRepository.create({
        university: university,
        course: course,
        subject: subject,
      });
      await this.universityCourseSubjectRepository.save(
        universityCourseSubject,
      );
    }
  }
}
