import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateBlogDto {
  @ApiProperty({ description: 'The id of the post' })
 @IsOptional()
  id: string;
  @ApiProperty({ description: 'The title of the post' })
 @IsOptional()
  title: string;

  @ApiProperty({ description: 'The slug of the post', required: false })
  @IsOptional()
  slug: string;

  @ApiProperty({ description: 'The meta title of the post', required: false })
  @IsOptional()
  metaTitle: string;

  @ApiProperty({
    description: 'The meta description of the post',
    required: false,
  })
  @IsOptional()
  metaDescription: string;

  @ApiProperty({ description: 'The contents of the post' })
 @IsOptional()
  contents: string;

  @ApiProperty({
    description: 'An array of tags associated with the post',
    type: [String],
    required: false,
  })
 @IsOptional()
  tags: string[];

  @ApiProperty({
    description: 'The ID of the author of the post',
    required: false,
  })
  @IsOptional()
  author?: string;

  @ApiProperty({
    description: 'An array of image URLs associated with the post',
    type: [String],
    required: false,
  })
  @IsOptional()
  images: string[];

  @ApiProperty({
    description: 'The URL of the cover image for the post',
    required: false,
  })
  @IsOptional()
  coverImage: string;

  @ApiProperty({
    description: 'The schema markup for SEO purposes',
    required: false,
  })
 @IsOptional()
  schemaMarkup: string;
}
