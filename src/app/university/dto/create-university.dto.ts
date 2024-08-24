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
import { v4 as uuidv4 } from 'uuid';



export class FinanceDetailsDto {
  @ApiProperty({ description: 'The tuition fee of the university' })
  @IsNotEmpty()
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

export class CourseDetailsDto {
  @ApiProperty({ description: 'The tuition fee of the university' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: 'The destination ID of the university' })
  @IsArray()
  subjects: SubjectDto[];

  @ApiProperty({ description: 'The tuition fee of the university' })
  @IsNotEmpty()
  financeDetails: CampusesDto[];

 
}

export class SubjectDto {
   @ApiProperty({ description: 'The subject of course' })
  @IsNotEmpty()
  @IsString()
  subjectName: string;

}

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

export class CreateUniversityDto {
  @ApiProperty({ description: 'The name of the university' })
  @IsNotEmpty()
  universityName: string;


  @ApiProperty({ description: 'The slug of the university (optional)' })
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: 'The description of the university (optional)' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Other description of the university (optional)',
  })
  @IsOptional()
  otherDescription?: string;

  @ApiProperty({ description: 'The world ranking of the university' })
  @IsNotEmpty()
  worldRanking: number;

  @ApiProperty({ description: 'The country ranking of the university' })
  // @IsNotEmpty()
  countryRanking: number;

  @ApiProperty({ description: 'The image URL of the university (optional)' })
  @IsOptional()
  universityImage?: string;

  @ApiProperty({ description: 'The destination ID of the university' })
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ description: 'The destination ID of the university' })
  @IsArray()
  courses: CourseDetailsDto[];

  

  @ApiProperty({ description: 'Campuses of the university' })
  @IsNotEmpty()
  campuses: CampusesDto[];

  // @ApiProperty({ description: 'created At' })
  // @IsOptional()
  // createdAt?: Date;
}
