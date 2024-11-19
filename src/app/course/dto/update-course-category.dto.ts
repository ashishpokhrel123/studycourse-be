import { IsOptional, IsString } from "class-validator";

export class UpdateCourseCategoryDto {
  @IsString()
  @IsOptional()
  id: string;
  courseCategory: string;
}