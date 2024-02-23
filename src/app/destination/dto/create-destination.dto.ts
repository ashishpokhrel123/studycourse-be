import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDestinationDto {
  @ApiProperty({ description: 'The name of the study destination' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The slug of the destination (optional)' })
  @IsOptional()
  slug: string;

  @ApiProperty({ description: 'The description of the university (optional)' })
  @IsOptional()
  description: string;
}
