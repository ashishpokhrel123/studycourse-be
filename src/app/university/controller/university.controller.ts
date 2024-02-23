import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UniversityService } from '../service/university.service';
import { CreateUniversityDto } from '../dto/create-university.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common/exceptions';
import { University } from 'src/common/entities/university.entity';
import { CreateSuccessResponse } from 'src/common/response/response';
import { SearchCriteriaDTO } from '../dto/search-university.dto';

@ApiTags('University')
@Controller('university')
@ApiBearerAuth()
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create a new University',
    description: 'Create a new university with the provided data',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'University created successfully',
    type: University,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request: Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async createUniversity(
    @Body() createUniversityDto: CreateUniversityDto,
  ): Promise<any> {
    console.log(createUniversityDto, 'dto');
    try {
      const newUniversity = await this.universityService.createUniversity(
        createUniversityDto,
      );
      return CreateSuccessResponse("University added succesfully")
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  @ApiOperation({
    summary: 'Fetch all universities',
    description: 'Retrieve all universities available',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Universities fetched successfully',
    type: [University],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getAllUniversities(): Promise<University[]> {
    try {
      const universities = await this.universityService.getUniversity();
      return universities;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'University fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'University fetch succesfully',
    type: CreateSuccessResponse,
  })
  async getUniversityById(@Param('id') id: string): Promise<any> {
    const result = await this.universityService.getUniversityById(id);
    return result;
  }

  @Get('/:slug')
  @ApiOperation({
    summary: 'Fetch a university by slug',
    description: 'Retrieve a university using its slug',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'University fetched successfully',
    type: University,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'University not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getUniversityBySlug(@Param('slug') slug: string): Promise<University> {
    try {
      const university = await this.universityService.getUniversityBySlug(slug);
      if (!university) {
        throw new NotFoundException('University not found');
      }
      return university;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // this api is sued to serach university by course and level
  @Post('search')
  @ApiOperation({
    summary: 'Search universities',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search universities based on provided criteria',
    type: CreateSuccessResponse,
  })
  async searchUniversities(
    @Body() searchCriteria: SearchCriteriaDTO,
  ): Promise<any> {
    const result = await this.universityService.searchUniversity(
      searchCriteria,
    );
    return result;
  }

@Get('/course/:course')
@ApiOperation({
  summary: 'Fetch a university by course',
  description: 'Retrieve a university using its course',
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'University fetched successfully',
  type: University,
})
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'University not found',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error',
})
async getUniversityByCourses(@Param('course') course: string,  @Query('destination') destination?: string ): Promise<University> {
  const university = await this.universityService.getUniversityByCourse({course, destination});

  if (!university) {
    throw new NotFoundException('University not found');
  }

  return university;
}

@Get('multiple/:ids')
  @ApiOperation({
    summary: 'Fetch universities by IDs',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Universities fetched successfully',
  })
  async getUniversitiesByIds(@Param('ids') ids: string): Promise<any[]> {
    console.log(ids, "ids");
    try {
      if (!ids)
        throw new HttpException(
          'IDs parameter is required.',
          HttpStatus.BAD_REQUEST,
        );

      // Split the path parameter string of IDs into an array
      const idArray = ids.split(',');
      console.log(idArray, "array")

      return this.universityService.getUniversityByIds(idArray);
    } catch (error) {
      // Handle error here
    }
  }


   
}
