import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserGender } from 'src/common/entities/user.entity';

export class RegisterUserDTO {
  @ApiProperty({ description: 'The first name of the user' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The middle name of the user' })
  @IsOptional()
  middleName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The phone number of the user' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'The country of the user' })
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({ description: 'The desire sudy level of the user' })
  @IsNotEmpty()
  studyLevel: string;



  @ApiProperty({ description: 'The desire destiantion  of the user' })
  @IsNotEmpty()
  destination: string;

  // @ApiProperty({ description: 'The gender of the user' })
  // @IsEnum(UserGender)
  // gender: UserGender.;

  @ApiProperty({ description: 'The date of birth of the user' })
  @IsNotEmpty()
  dateOfBirth: string;


  @ApiProperty({ description: 'The date of birth of the user' })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'The consullencing otpions' })
  @IsNotEmpty()
  counselingOption: string;

  @ApiProperty({ description: 'The terms and condtions' })
  @IsOptional()
  termsAndConditionsAccepted: boolean;
}
