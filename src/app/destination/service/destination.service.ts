import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import slugify from 'slugify';
import { DestinationRepository } from '../respository/destinationRespository';
import { CreateDestinationDto } from '../dto/create-destination.dto';
import { Destination } from 'src/common/entities/destination';

@Injectable()
export class DestinationService {
  constructor(private readonly destinationRepository: DestinationRepository) {}

  async createDestination(destination: CreateDestinationDto): Promise<any> {
    try {
      const { name, slug, description } = destination;

      if (isEmpty(name) || isEmpty(description))
        throw new HttpException(
          'All fields  are required.',
          HttpStatus.BAD_REQUEST,
        );

      const newDestination = await this.destinationRepository.createDestination(
        {
          name,
          slug: slugify(name.toLowerCase()),
          description,
        },
      );
      return newDestination;
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
  async getDestination(): Promise<Destination[]> {
    try {
      const destination = await this.destinationRepository.fetchDestination();
      return destination;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getDestinationBySlug(slug: string): Promise<any> {
    try {
      if (isEmpty(slug))
        throw new HttpException(
          'Slug parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.destinationRepository.fetchDestinationBySlug(slug);
    } catch (error) {}
  }
  async getUniversityByDestination(slug: string): Promise<any> {
    try {
      if (isEmpty(slug))
        throw new HttpException(
          'Slug parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.destinationRepository.fetchUniversityByDestination(slug);
    } catch (error) {}
  }
}
