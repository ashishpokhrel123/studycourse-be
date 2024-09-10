import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

// DTO for Finance Details
export class FinanceDetailsDto {
  @ApiProperty({ description: 'The tuition fee of the university' })
  @IsNumber()
  tuitionFee: number;

  @ApiProperty({ description: 'The currency used for tuition fee (optional)' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Availability of financial aid (optional)' })
  @IsOptional()
  @IsBoolean()
  financialAidAvailable?: boolean;

  @ApiProperty({ description: 'Details about scholarships offered (optional)' })
  @IsOptional()
  @IsString()
  scholarshipDetails?: string;
}

// DTO for Campus Details
export class CampusesDto {
  @ApiProperty({ description: 'The campus location of the university' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: 'The campus email of the university' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'The campus contact of the university' })
  @IsNotEmpty()
  @IsString()
  contact: string;
}

// DTO for Subject Details
export class SubjectDto {
  @ApiProperty({ description: 'The subject of the course' })
  @IsNotEmpty()
  @IsString()
  subjectName: string;

  @ApiProperty({ description: 'The description of the subject (optional)' })
  @IsOptional()
  @IsString()
  description?: string;
}

// DTO for Course Details
export class CourseDetailsDto {
  @ApiProperty({ description: 'The ID of the course' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'Subjects of the course' })
  @IsNotEmpty()
  subjects: SubjectDto[];

  @ApiProperty({ description: 'Finance details related to the course' })
  @IsNotEmpty()
  financeDetails: FinanceDetailsDto[];
}

// DTO for Updating a University
export class UpdateUniversityDto {
  @ApiProperty({ description: 'The ID of the university' })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'The name of the university (optional)' })
  @IsOptional()
  @IsString()
  universityName?: string;

   @ApiProperty({ description: 'The name of the university (optional)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'The description of the university (optional)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The world ranking of the university (optional)' })
  @IsOptional()
  @IsNumber()
  worldRanking?: number;

  @ApiProperty({ description: 'The image URL of the university (optional)' })
  @IsOptional()
  @IsString()
  universityImage?: string;

  @ApiProperty({ description: 'The destination ID of the university (optional)' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiProperty({ description: 'Courses offered by the university (optional)' })
  @IsOptional()
  @IsArray()
  courses?: CourseDetailsDto[];

  @ApiProperty({ description: 'Campuses of the university (optional)' })
  @IsOptional()
  @IsArray()
  campuses?: CampusesDto[];
}
