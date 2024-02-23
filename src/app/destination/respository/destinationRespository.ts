import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Destination } from 'src/common/entities/destination';
import { CreateDestinationDto } from '../dto/create-destination.dto';
import { University } from 'src/common/entities/university.entity';

@Injectable()
export class DestinationRepository {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,
  ) {}

  async createDestination({ name, slug, description }): Promise<any> {
  const dest =   this.destinationRepository.create({
    name,
    slug,
    createdAt:new Date()
  });
  return this.destinationRepository.save(dest)
}


  // async updateUniversity(
  //   id: string,
  //   updateUniversityDto: UpdateUniversityDto,
  // ): Promise<University> {
  //   // const university = await this.universityRepository.findOne({where});
  //   // if (!university) {
  //   //   throw new Error('University not found');
  //   // }
  //   // // Update university fields
  //   // // ...

  //   return this.universityRepository.save(updateUniversityDto);
  // }

  async fetchDestination(): Promise<Destination[]> {
    return this.destinationRepository.find({relations:["universities"]});
  }

  async fetchDestinationBySlug({ slug }: any): Promise<Destination> {
    return this.destinationRepository.findOne({ where: { slug } });
  }

   async fetchUniversityByDestination({ slug }: any): Promise<any> {
    const destination = await this.destinationRepository.findOne({ where: { slug }, relations: ["universities"] });
    if (!destination) {
      throw new Error('Destination not found');
    }


    
    return {
      status: HttpStatus.OK,
      message: "Universities fetched successfully",
      data: {
         destination: destination.name,
         universities: destination.universities
      }
    }
  }
}
