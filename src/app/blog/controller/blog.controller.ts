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
  Request, // Import Request
  UseGuards,
  HttpException, // Import UseGuards
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
  @Post('update')
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

  // @Get('/:id')
  // @ApiOperation({
  //   summary: 'Course fetch succesfully',
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Course fetch succesfully',
  //   type: CreateSuccessResponse,
  // })
  // async getCourseByIds(@Param('id') id: string): Promise<any> {
  //   const result = await this.courseService.getCourseById({id});
  //   return {
  //     status: HttpStatus.OK,
  //     message:"Cousre fetch succesfully",
  //     data: result
  //   }
  // }

  @Get('/:id')
  @ApiOperation({
    summary: 'Blog fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog fetch succesfully',
    type: CreateSuccessResponse,
  })
  async getBlogById(@Param('id') id: string): Promise<any> {
    const result = await this.blogService.getBlogById(id);
    return result;
  }

  @Get('/:slug')
  @ApiOperation({
    summary: 'Blog fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blog fetch succesfully',
    type: CreateSuccessResponse,
  })
  async getBlogBySlug(@Param('slug') slug: string): Promise<any> {
    console.log(slug)
    const result = await this.blogService.getBlogBySlug(slug);
    return CreateSuccessResponse(result.message, result.data);
  }
}
