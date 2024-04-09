import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  HttpStatus,
  Request,
  UseGuards,
  HttpException,
  Put,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
import { CreateSuccessResponse } from 'src/common/response/response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BlogService } from '../service/blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@ApiTags('Blog')
@Controller('blog')
@UseFilters(new HttpExceptionFilter())
@ApiBearerAuth()
@ApiSecurity('bearerAuth')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create a new blog',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Blog created successfully',
    type: CreateSuccessResponse,
  })
  async createCourse(
    @Body() createBlogDto: CreateBlogDto,
    @Request() req,
  ): Promise<any> {
    try {
      createBlogDto.author = req.user.id;
      const newblog = await this.blogService.createBlog(createBlogDto);
      return newblog;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  @ApiOperation({
    summary: 'Update a new blog',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Blog updated successfully',
    type: CreateSuccessResponse,
  })

  async updateCourse(@Body() updateBlogDto: UpdateBlogDto): Promise<any> {
    
    try {
      console.log(updateBlogDto, "dtooo")
      const updatedCourse = await this.blogService.updateBlog(updateBlogDto);
      return updatedCourse;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all blog',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog fetch successfully',
    type: CreateSuccessResponse,
  })
  async getBlog(): Promise<any> {
    try {
      const fetchBlog = await this.blogService.getBlog();
      return CreateSuccessResponse('Blog fetch successfully', fetchBlog);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('slug/:slug') // Updated route
  @ApiOperation({ summary: 'Fetch a blog by slug' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog fetched successfully',
    type: CreateSuccessResponse,
  })
  async getBlogBySlug(@Param('slug') slug: any): Promise<any> {
    try {
      const result = await this.blogService.getBlogBySlug({ slug });
      return result;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('id/:id') // Updated route
  @ApiOperation({
    summary: 'Blog fetch successfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog fetch successfully',
    type: CreateSuccessResponse,
  })
  async getBlogById(@Param('id') id: string): Promise<any> {
    try {
      const result = await this.blogService.getBlogById(id);
      return result;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
