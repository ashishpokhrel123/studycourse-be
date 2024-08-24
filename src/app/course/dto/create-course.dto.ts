import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class StudyLevelDTO {
  @ApiProperty({ description: 'The name of the study level' })
  @IsNotEmpty()
  levelName: string;

  @ApiProperty({ description: 'The slug of the study level' })
  @IsOptional()
  slug: string;

  @ApiProperty({ description: 'The description of the study level' })
  @IsOptional()
  levelDescription: string;

  @ApiProperty({ description: 'The other description of the study level' })
  @IsOptional()
  levelOtherDescription: string;
}

export class SubjectDTO {
  @ApiProperty({ description: 'The name of the subject' })
  @IsNotEmpty()
  subjectName: string;

  @ApiProperty({ description: 'The description of the subject' })
  @IsNotEmpty()
  description: string;
}

export class CourseCategoryDTO {
  @ApiProperty({ description: 'The name of the course category' })
  @IsNotEmpty()
  courseCategory: string;

  
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
  levels: StudyLevelDTO;

  // @ApiProperty({ description: 'The subjects of the course' })
  // @IsNotEmpty()
  // subjects: SubjectDTO[];

  @ApiProperty({ description: 'The category of the course' })
  @IsNotEmpty()
  category: CourseCategoryDTO;
}
