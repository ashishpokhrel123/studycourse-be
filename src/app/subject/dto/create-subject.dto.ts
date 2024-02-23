import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ description: 'The subject name of the course' })
  @IsNotEmpty()
  subjectName: string;

  @ApiProperty({ description: 'The subject description of the course' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The subject description of the course' })
  @IsNotEmpty()
  course: string;
}
