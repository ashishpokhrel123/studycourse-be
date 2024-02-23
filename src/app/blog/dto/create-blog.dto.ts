import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateBlogDto {
  @ApiProperty({ description: 'The title of the post' })
  @IsNotEmpty()
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
  @IsNotEmpty()
  contents: string;

  @ApiProperty({
    description: 'An array of tags associated with the post',
    type: [String],
    required: false,
  })
  @IsNotEmpty()
  tags: string[];

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
  @IsNotEmpty()
  schemaMarkup: string;

  @ApiProperty({
    description: 'The URL of the author for the post',
    required: false,
  })
  @IsOptional()
  author: string;
}
