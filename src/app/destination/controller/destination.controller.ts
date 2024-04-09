import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpException,
  UseFilters,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSuccessResponse } from 'src/common/response/response';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
import { DestinationService } from '../service/destination.service';
import { CreateDestinationDto } from '../dto/create-destination.dto';


@ApiTags('Study Destination')
@Controller('destination')
@UseFilters(new HttpExceptionFilter())
@ApiBearerAuth()
@ApiSecurity('bearerAuth')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create a new Study Destination',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Destination created successfully',
    type: CreateSuccessResponse,
  })
  async createCourse(
    @Body() createDestinationDto: CreateDestinationDto,
  ): Promise<any> {
    try {
      const newDestination = await this.destinationService.createDestination(
        createDestinationDto,
      );
      return CreateSuccessResponse(
        'Destination created successfully',
        newDestination,
      );
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // @UseGuards(JwtAuthGuard)
  // @Post('update')
  // @ApiOperation({
  //   summary: 'Update a new course',
  // })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Course updated successfully',
  //   type: CreateSuccessResponse,
  // })
  // async updateCourse(@Body() updateCourseDto: UpdateCourseDto): Promise<any> {
  //   try {
  //     const updatedCourse = await this.courseService.updateCourse(
  //       updateCourseDto,
  //     );
  //     return CreateSuccessResponse(
  //       'Course updated successfully',
  //       updatedCourse,
  //     );
  //   } catch (error) {
  //     throw new HttpException(
  //       'Internal Server Error',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  @Get('all')
  @ApiOperation({
    summary: 'Fetch  all  study destinations',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Destiantion fetch successfully',
    type: CreateSuccessResponse,
  })
  async getDestination(): Promise<any> {
    try {
      const fetchDestination= await this.destinationService.getDestination();
      return CreateSuccessResponse(
        'Destination fetch successfully',
        fetchDestination,
      );
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:slug')
  @ApiOperation({
    summary: 'Destination fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Destination fetch succesfully',
    type: CreateSuccessResponse,
  })
  async getDestinationBySlug(@Param('slug') slug: string): Promise<any> {
    const result = await this.destinationService.getDestinationBySlug(slug);
    console.log(result, "result")
    return result
  }

  @Get('fetchUniversity/:slug')
  @ApiOperation({
    summary: 'Destination fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Destination fetch succesfully',
    type: CreateSuccessResponse,
  })
  async getUniversityByDestination(@Param('slug') slug: string): Promise<any> {
    const result = await this.destinationService.getUniversityByDestination(slug);
    return CreateSuccessResponse(result.message, result.data);
  }
}
