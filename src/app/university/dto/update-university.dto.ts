import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

export class UpdateUniversityDto {


  @ApiProperty({ description: 'The id of the university' })

  id: string;


  @ApiProperty({ description: 'The name of the university' })

  universityName: string;

  // @ApiProperty({ description: 'The address of the university' })

  // universityAddress: string;

  // @ApiProperty({ description: 'The contact number of the university' })

  // universityContactNumber: string;

   @ApiProperty({ description: 'The description of the university' })

  description: string;

  // @ApiProperty({ description: 'The email of the university' })

  // universityEmail: string;

  @ApiProperty({ description: 'The world ranking of the university' })

  worldRanking: number;

  // @ApiProperty({ description: 'The country ranking of the university' })

  // countryRanking: number;

  @ApiProperty({ description: 'The image URL of the university (optional)' })
  @IsOptional()
  universityImage?: string;

  @ApiProperty({ description: 'The destination ID of the university' })

  destination: string;

  @ApiProperty({ description: 'The course ID of the university' })

  courses: string[];

  @ApiProperty({ description: 'FinanceDetails of the university' })

  financeDetails: FinanceDetailsDto;

  @ApiProperty({ description: 'Campuses of the university' })
  @IsOptional()
  campuses: CampusesDto[];
}
