import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { UserGender } from 'src/common/entities/user.entity';

class LoginDTO {
  @ApiProperty({ description: 'email of user' })
  @IsEmail()
  email: string;
  
  @ApiProperty({ description: 'password of user' })
  @IsNotEmpty()
  password: string;
}

class RegisterDTO {
  @ApiProperty({ description: 'The first name of the user' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The phone number of the user' })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'The address of the user' })
  @IsNotEmpty()
  address: string;


  @ApiProperty({ description: 'The gender of the user' })
  @IsEnum(UserGender)
  gender: UserGender;

  
  @ApiProperty({ description: 'The date of birth of the user' })
  @IsNotEmpty()
  dateOfBirth: string;


  @ApiProperty({ description: 'The phone number of the user' })
  @IsOptional()
  googleId: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsOptional()
  password: string;
}

export { LoginDTO, RegisterDTO };
