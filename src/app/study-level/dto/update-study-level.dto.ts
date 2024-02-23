import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class StudyLevelUpdateDTO {

  @ApiProperty({ description: 'The study level id of the study level' })
  @IsNotEmpty()
  id: string;
  @ApiProperty({ description: 'The study level name of the study level' })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ description: 'The study level slug of the study level' })
  @IsOptional()
  slug: string;
  @ApiProperty({ description: 'The study level description of the study level' })
  @IsOptional()
  description: string;
  @ApiProperty({ description: 'The study level other description of the study level' })
  @IsOptional()
  otherDescription: string;
}


