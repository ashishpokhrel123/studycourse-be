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
import { StudyLevelService } from '../service/study-level.service';

@ApiTags('Study Level')
@Controller('studyLevel')
@UseFilters(new HttpExceptionFilter())
@ApiBearerAuth()
@ApiSecurity('bearerAuth')
export class StudyLevelController {
  constructor(private readonly studyLevelService: StudyLevelService) {}
  @Get('all')
  @ApiOperation({
    summary: 'Study Level fetch successfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Study Level fetch successfully',
    type: CreateSuccessResponse,
  })
  async getStudyLevel(): Promise<any> {
    try {
      const fetchStudyLevel = await this.studyLevelService.getStudyLevel();
      return CreateSuccessResponse(
        'Study Level fetch successfully',
        fetchStudyLevel,
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
    summary: 'Study Level fetch successfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Study Level fetch successfully',
    type: CreateSuccessResponse,
  })
  async getStudyLevelBySlug(@Param('slug') slug: string): Promise<any> {
    const result = await this.studyLevelService.getStudyLevelBySlug(slug);
    return CreateSuccessResponse(result.message, result.data);
  }
}
