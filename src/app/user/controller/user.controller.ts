import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateSuccessResponse } from 'src/common/response/response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterUserDTO } from '../dto/create-user.dto';

interface SuccessResponse {
  status: string;
  data: any;
  message?: string;
}
@ApiTags('User')
@Controller('user')
@UseFilters(new HttpExceptionFilter())
@ApiBearerAuth()
@ApiSecurity('bearerAuth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({
    summary: 'User fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User fetch succesfully',
    type: CreateSuccessResponse,
  })
  async getProfile(@Request() req): Promise<any> {
    const result = await this.userService.getProfile(req.user.id);
    console.log(result, 'result');
    return CreateSuccessResponse(result.message, result.data);
  }

  // api for register and appoinment
  @Post('register')
  @ApiOperation({
    summary: 'User saved succesfully',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User saved succesfully',
    type: CreateSuccessResponse,
  })
  @ApiBody({ type: RegisterUserDTO })
  async registerUser(@Body() registerUserDTO: RegisterUserDTO) {
   
    try {
      console.log(registerUserDTO, "user dto")
      const user = await this.userService.registerUser(registerUserDTO);
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // api for register and appoinment
  @Get('getStudents')
  @ApiOperation({
    summary: 'Students fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Students fetch succesfully',
    type: CreateSuccessResponse,
  })
 
  async fetchStudent(): Promise<any> {
   
    try {
      const user = await this.userService.fetchUser();
      return CreateSuccessResponse(user.message, user.data);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

   // api for register and appoinment
  @Post('addUser')
  @ApiOperation({
    summary: 'User created succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Students fetch succesfully',
    type: CreateSuccessResponse,
  })
 
  async addUser(@Body() registerUserDTO: any): Promise<any> {
   
    try {
      const user = await this.userService.addUser(registerUserDTO);
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

   // api for register and appoinment
  @Post('addNewUser')
  @ApiOperation({
    summary: 'User created succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Students fetch succesfully',
    type: CreateSuccessResponse,
  })
 
  async addNewUser(@Body() registerUserDTO: any): Promise<any> {
   
    try {
      const user = await this.userService.addNewUser(registerUserDTO);
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // get all user
  @Get('all')
  @ApiOperation({
    summary: 'User fetch succesfully',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Students fetch succesfully',
    type: CreateSuccessResponse,
  })
 
  async fetchAllUser(): Promise<any> {
   
    try {
      const user = await this.userService.fetchAllUser();
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  
}
