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
  HttpException,
  Query,
  Put, // Import UseGuards
} from '@nestjs/common';
import { CourseService } from '../service/course.service';
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
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { Course } from 'src/common/entities/course.entity';

@ApiTags('Course')
@Controller('courses')
@UseFilters(new HttpExceptionFilter())
@ApiBearerAuth()
@ApiSecurity('bearerAuth')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create a new course',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Course created successfully',
    type: CreateSuccessResponse,
  })
  async createCourse(@Body() createCourseDto: CreateCourseDto): Promise<any> {
    try {
      
      const newCourse = await this.courseService.createCourse(createCourseDto);
      return CreateSuccessResponse('Course created successfully', newCourse);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // @UseGuards(JwtAuthGuard)
  @Put('update')
  @ApiOperation({
    summary: 'Update a new course',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Course updated successfully',
    type: CreateSuccessResponse,
  })
  async updateCourse(@Body() updateCourseDto: UpdateCourseDto): Promise<any> {
    console.log(updateCourseDto, "dto")
    try {
      const updatedCourse = await this.courseService.updateCourse(
        updateCourseDto,
      );
      return CreateSuccessResponse(
        'Course updated successfully',
        updatedCourse,
      );
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  @ApiOperation({
    summary: 'Update a new course',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course fetch successfully',
    type: CreateSuccessResponse,
  })
  async getCourse(): Promise<any> {
    try {
      const fetchCourse = await this.courseService.getCourses();
      return CreateSuccessResponse('Course fetch successfully', fetchCourse);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Course fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course fetch succesfully',
    type: CreateSuccessResponse,
  })
  async getCourseByIds(@Param('id') id: string): Promise<any> {
    const result = await this.courseService.getCourseById({id});
    return {
      status: HttpStatus.OK,
      message:"Cousre fetch succesfully",
      data: result
    }
  }
  
  @Get('/:slug')
  @ApiOperation({
    summary: 'Course fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Course fetch succesfully',
    type: CreateSuccessResponse,
  })
  async getCourseById(@Param('slug') slug: string): Promise<any> {
    const result = await this.courseService.getCourseBySlug(slug);
    return CreateSuccessResponse(result.message, result.data);
  }

  @Get('subject/:course')
  @ApiOperation({
    summary: 'Subject fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject fetch succesfully',
    type: CreateSuccessResponse,
  })
  async getSubjecteByCourse(@Param('course') course: string): Promise<any> {
    const result = await this.courseService.getSubjectByCourse(course);
    return result;
  }

  @Get('level/:level')
  @ApiOperation({
    summary: 'Subject fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subject fetch succesfully',
    type: CreateSuccessResponse,
  })
   async getCoursesByLevel(
    @Param('level') level: string,
    @Query('universityId') universityId?: string,
    @Query('destination') destination?: string 
  ): Promise<any> {
    const result = await this.courseService.getCourseByLevel({ level, universityId, destination });
    return result;
  }

 
}
