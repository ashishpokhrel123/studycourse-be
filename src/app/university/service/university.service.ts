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
        universityAddress,
        universityContactNumber,
        universityEmail,
        slug,
        description,
        otherDescription,
        worldRanking,
        countryRanking,
        universityImage,
        financeDetails,
        destination,
        course
      } = university;

      if (isEmpty(universityName) || isEmpty(description))
        throw new HttpException(
          'All fields  are required.',
          HttpStatus.BAD_REQUEST,
        );

      const newUniversity = await this.universityRepository.createUniversity({
        universityName,
        universityAddress,
        universityContactNumber,
        universityEmail,

        slug: slugify(universityName.toLowerCase()),
        description,
        otherDescription,
        worldRanking,
        countryRanking,
        universityImage,
        financeDetails,
        destination,
        course
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
  async getUniversityBySlug(slug: string): Promise<any> {
    try {
      if (isEmpty(slug))
        throw new HttpException(
          'Slug parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.universityRepository.fetchUniversityBySlug(slug);
    } catch (error) {}
  }

  async searchUniversity(searchCriteria: SearchCriteriaDTO): Promise<any> {
    try {
      const { course, level, location, rankingOrder, feesOrder, scholarship } =
        searchCriteria;
      return await this.universityRepository.searchUniversity({
        course,
        level,
        location,
        rankingOrder,
        feesOrder,
        scholarship,
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

   async getUniversityByCourse({course, destination}): Promise<any> {
    try {
      if (isEmpty(course))
        throw new HttpException(
          'Course parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.universityRepository.fetchUniversityByCourse({course, destination});
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

}
