import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class StudyLevel {
  @ApiProperty({ description: 'The name of the study level' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The slug of the study level' })
  @IsOptional()
  slug: string;

  @ApiProperty({ description: 'The description of the study level' })
  @IsOptional()
  description: string;

  @ApiProperty({ description: 'The other description of the study level' })
  @IsOptional()
  otherDescription: string;
}

export class Subject {
  @ApiProperty({ description: 'The name of the subject' })
  @IsNotEmpty()
  subjectName: string;

  @ApiProperty({ description: 'The description of the subject' })
  @IsNotEmpty()
  description: string;
}

export class CreateCourseDto {
  @ApiProperty({ description: 'The name of the course' })
  @IsNotEmpty()
  courseName: string;

  @ApiProperty({ description: 'The description of the course' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The study level of the course' })
  @IsNotEmpty()
  level: StudyLevel;

  @ApiProperty({ description: 'The subjects of the course' })
  @IsNotEmpty()
  subjects: Subject[];
}
