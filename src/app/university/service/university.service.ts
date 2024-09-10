import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import slugify from 'slugify';
import { UniversityRepository } from '../respository/universityRespository';
import { CreateUniversityDto } from '../dto/create-university.dto';
import { UpdateUniversityDto } from '../dto/update-university.dto';
import { University } from 'src/common/entities/university.entity';
import { SearchCriteriaDTO } from '../dto/search-university.dto';

@Injectable()
export class UniversityService {
  constructor(private readonly universityRepository: UniversityRepository) {}

  async createUniversity(university: CreateUniversityDto): Promise<any> {
    try {
      const {
        universityName,
        // universityAddress,
        // universityContactNumber,
        // universityEmail,
        slug,
        description,
        otherDescription,
        worldRanking,
        countryRanking,
        universityImage,
        // financeDetails,
        destination,
        courses,
        campuses,
      } = university;

      if (isEmpty(universityName) || isEmpty(description))
        throw new HttpException(
          'All fields  are required.',
          HttpStatus.BAD_REQUEST,
        );

      const newUniversity = await this.universityRepository.createUniversity({
        universityName,
        slug: slugify(universityName.toLowerCase()),
        description,
        otherDescription,
        worldRanking,
        countryRanking,
        universityImage,
        destination,
        courses,
        campuses,
      });
      return newUniversity;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateUniversity(university: UpdateUniversityDto): Promise<any> {
    try {
      const {
        id,
        universityName,
        description,
        universityImage,
        worldRanking,
        destination,
        courses,
        campuses,
      } = university;

      const updatedUniversity =
        await this.universityRepository.updateUniversity({
          id,
          universityName,
          description,
          universityImage,
          worldRanking,
          destination,
          courses,
          campuses,
        });

      return updatedUniversity;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async updateCourse(course: UpdateUniversityDto): Promise<any> {
  //   try {
  //     const { id, courseName, description } = course;
  //     const updatedCourse = await this.courseRepository.updateCourse({
  //       id,
  //       courseName,
  //       description,
  //     });
  //     return updatedCourse;
  //   } catch (error) {
  //     throw new HttpException(
  //       'Internal Server Error',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
  async getUniversity(): Promise<University[]> {
    try {
      const course = await this.universityRepository.fetchUniversity();
      return course;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

   async getUniversityPublic(): Promise<University[]> {
    try {
      const course = await this.universityRepository.fetchUniversityPublic();
      return course;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getUniversityBySlug({ slug }: any): Promise<any> {
    console.log(slug, 'in services');
    try {
      if (isEmpty(slug))
        throw new HttpException(
          'Slug parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.universityRepository.fetchUniversityBySlug({ slug });
    } catch (error) {}
  }

  async searchUniversity(searchCriteria: SearchCriteriaDTO): Promise<any> {
    try {
      const { course, level, location, rankingOrder, feesOrder, scholarship, courseCategory  } =
        searchCriteria;
      return await this.universityRepository.searchUniversity({
        course,
        level,
        location,
        rankingOrder,
        feesOrder,
        scholarship,
        courseCategory
      });
    } catch (error) {
      console.error('Error searching universities:', error);
      throw error;
    }
  }

  async getUniversityById(id: string): Promise<any> {
    try {
      if (isEmpty(id))
        throw new HttpException(
          'Id parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.universityRepository.fetchUniversityById({ id });
    } catch (error) {}
  }

  async getUniversityByCourse({ course, destination }): Promise<any> {
    try {
      if (isEmpty(course))
        throw new HttpException(
          'Course parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.universityRepository.fetchUniversityByCourse({
        course,
        destination,
      });
    } catch (error) {}
  }
  async getUniversityByIds(ids: string[]): Promise<any[]> {
    try {
      if (isEmpty(ids))
        throw new HttpException(
          'Ids parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.universityRepository.fetchUniversitiesByIds(ids);
    } catch (error) {
      // Handle error here
    }
  }

  async updateStatusUniversity(id: string): Promise<void> {
    try {
      if (isEmpty(id))
        throw new HttpException(
          'Id parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      await this.universityRepository.updateStatusUniversity(id);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

   async fetchSubjectsByUniversity(id: string): Promise<any> {
    console.log(id, "iddd")
    try {
      if (isEmpty(id))
        throw new HttpException(
          'Id parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return await this.universityRepository.fetchSubjectsByUniversity(id);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
