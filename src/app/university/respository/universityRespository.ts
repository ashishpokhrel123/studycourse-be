import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { University } from 'src/common/entities/university.entity';
import { UpdateUniversityDto } from '../dto/update-university.dto';
import { CreateUniversityDto } from '../dto/create-university.dto';
import { Destination } from 'src/common/entities/destination.entity';
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
    const { destination, financeDetails, course, ...universityData } =
      createUniversityDto;

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

    const courses = await this.courseRepository.findOne({
      where: { id: course },
    });
    if (!course) {
      throw new Error(`Course with ID ${course} not found`);
    }
    savedUniversity.courses = [courses];

    await this.universityRepository.save(savedUniversity);

    return {
      status: HttpStatus.CREATED,
      message: 'University created successfully',
    };
  }

  async updateUniversity(
    id: string,
    updateUniversityDto: UpdateUniversityDto,
  ): Promise<{ status: number; message: string | HttpException }> {
    const { destination, financeDetails, course, ...universityData } =
      updateUniversityDto;

    // Fetch the university by ID
    const university = await this.universityRepository.findOne({where: { id}, relations:["courses", "destination"]});
    if (!university) {
      throw new Error('University not found');
    }

    // Update the university entity
    Object.assign(university, {
      universityName: universityData.universityName,
      universityAddress: universityData.universityAddress,
      universityContactNumber: universityData.universityContactNumber,
      universityEmail: universityData.universityEmail,
      slug: universityData.slug,
      description: universityData.description,
      worldRanking: universityData.worldRanking,
      countryRanking: universityData.countryRanking,
      universityImage: universityData?.universityImage,
    });

    // Save the updated university entity
    const updatedUniversity = await this.universityRepository.save(university);

    // Fetch the destination
    const fetchDestination = await this.studyDestinationRepository.findOne({
      where: { id: destination },
    });
    if (!fetchDestination) {
      throw new Error('Destination not found');
    }

    // Update the destination of the university
    updatedUniversity.destination = fetchDestination;
    await this.universityRepository.save(updatedUniversity);

    // Update the finance details
    const financeDetailsEntity = await this.financeDetailsRepository.findOne({
      where: { university: updatedUniversity },
    });
    if (!financeDetailsEntity) {
      throw new Error('Finance details not found');
    }
    Object.assign(financeDetailsEntity, financeDetails);
    await this.financeDetailsRepository.save(financeDetailsEntity);

    // Update the courses of the university
    const courses = await this.courseRepository.findOne({
      where: { id: course },
    });
    if (!courses) {
      throw new Error(`One or more courses with the provided IDs not found`);
    }
    updatedUniversity.courses = [courses];
    await this.universityRepository.save(updatedUniversity);

    return {
      status: HttpStatus.OK,
      message: 'University updated successfully',
    };
  }

  async fetchUniversity(): Promise<University[]> {
    return this.universityRepository.find();
  }

  async fetchUniversityBySlug(slug: string): Promise<University | null> {
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
      const query = this.universityRepository
        .createQueryBuilder('university')
        .leftJoinAndSelect('university.courses', 'course')
        .leftJoinAndSelect('course.studyLevel', 'studyLevel')
        .leftJoinAndSelect('university.destination', 'destination')
        .where('course.id = :courseId', { courseId: course })
        .andWhere('destination.id = :destinationId', {
          destinationId: location,
        })
        .andWhere('studyLevel.id = :studyLevelId', { studyLevelId: level });

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
     console.log(ids, "ids");
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
