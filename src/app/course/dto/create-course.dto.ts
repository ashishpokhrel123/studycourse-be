import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class StudyLevel {
  @ApiProperty({ description: 'The course name of the course' })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ description: 'The course name of the course' })
  @IsOptional()
  slug: string;
  @ApiProperty({ description: 'The course name of the course' })
  @IsOptional()
  description: string;
  @ApiProperty({ description: 'The course name of the course' })
  @IsOptional()
  otherDescription: string;
}

export class Subject {
  @ApiProperty({ description: 'The subject name of the course' })
  @IsNotEmpty()
  subjectName: string;

  @ApiProperty({ description: 'The subject description of the course' })
  @IsNotEmpty()
  description: string;
}

export class CreateCourseDto {
  @ApiProperty({ description: 'The course name of the course' })
  @IsNotEmpty()
  courseName: string;

  @ApiProperty({ description: 'The course description of the course' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The study level  of the course' })
  @IsNotEmpty()
  levelName: string;

  @ApiProperty({ description: 'The study level  of the course' })
  @IsOptional()
  levelDescription: string;

  @ApiProperty({ description: 'The study level  of the course' })
  @IsOptional()
  otherDescription: string;

  @ApiProperty({ description: 'The study level  of the course' })
  @IsNotEmpty()
  subjectName: string;

  @ApiProperty({ description: 'The study level  of the course' })
  @IsOptional()
  subjectDescription: string;
}
