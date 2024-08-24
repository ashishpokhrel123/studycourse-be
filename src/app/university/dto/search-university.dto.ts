import { IsOptional, IsString, IsIn } from 'class-validator';

export class SearchCriteriaDTO {
  @IsString()
  course: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC']) 
  rankingOrder?: 'ASC' | 'DESC'; 

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC']) 
  feesOrder?: 'ASC' | 'DESC'; 

  @IsOptional()
  @IsString()
  @IsIn(['yes', 'no']) 
  scholarship?: 'yes' | 'no'; 

  @IsOptional()
  @IsString()
  courseCategory?: string; 
}
