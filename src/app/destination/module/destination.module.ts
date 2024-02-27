import { Module } from '@nestjs/common';
import { DestinationService } from '../service/destination.service';
import { DestinationController } from '../controller/destination.controller';
import { DestinationRepository } from '../respository/destinationRespository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destination } from 'src/common/entities/destination.entity';
import { University } from 'src/common/entities/university.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Destination, University]),
  ],
  controllers: [DestinationController],
  providers: [DestinationService, DestinationRepository],
})
export class DestinationModule {}
