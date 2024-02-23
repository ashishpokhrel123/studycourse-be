import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsArray } from "class-validator";

export class UpdateCourseDto {

  @ApiProperty({ description: 'The course name of the course' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'The course name of the course' })
  @IsNotEmpty()
  courseName: string;

  @ApiProperty({ description: 'The course description of the course' })
  @IsNotEmpty()
  description: string;

}

