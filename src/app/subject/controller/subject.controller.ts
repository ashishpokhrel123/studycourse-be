// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   UseFilters,
//   HttpStatus,
//   Request, // Import Request
//   UseGuards,
//   HttpException, // Import UseGuards
// } from '@nestjs/common';
// import {
//   ApiBearerAuth,
//   ApiOperation,
//   ApiResponse,
//   ApiSecurity,
//   ApiTags,
// } from '@nestjs/swagger';
// import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
// import { CreateSuccessResponse } from 'src/common/response/response';
// import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// import { SubjectService } from '../service/subject.service';


// @ApiTags('Subject')
// @Controller('subject')
// @UseFilters(new HttpExceptionFilter())
// @ApiBearerAuth()
// @ApiSecurity('bearerAuth')
// export class SubjectController {
//   constructor(private readonly subjectService: SubjectService) {}
//   @Get('/:course')
//   @ApiOperation({
//     summary: 'Subject fetch succesfully',
//   })
//   @ApiResponse({
//     status: HttpStatus.OK,
//     description: 'Course fetch succesfully',
//     type: CreateSuccessResponse,
//   })
//   async getSubjectByCourse(@Param('course') course: string): Promise<any> {
//     const result = await this.subjectService.getSubjectByCourse(course);
//     return CreateSuccessResponse(result.message, result.data);
//   }
// }
