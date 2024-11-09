import {
  Controller,
  Get,
  Post,
  Headers,
  UseGuards,
  Req,
  Res,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { GoogleOauthGuard } from 'src/common/guards/google-oauth.guard';
import {
  CreateLoginSuccessResponse,
  CreateSuccessResponse,
} from 'src/common/response/response';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDTO, RegisterDTO } from '../dto/auth.dto';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({
    summary: 'User signup',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: CreateSuccessResponse,
  })
  // @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiBody({ type: RegisterDTO })
  async signup(@Body() registerDTO: RegisterDTO) {
    console.log(registerDTO, 'from client');
    try {
      const user = await this.authService.register(registerDTO);
      CreateSuccessResponse('User added successfully', user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  //login
  @Post('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successfully',
    type: CreateLoginSuccessResponse,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
 async login(@Body() loginDto: LoginDTO, @Res({ passthrough: true }) res: Response): Promise<any> {
  const { email, password } = loginDto;

  // Log in and get access and refresh tokens
  const loginResponse = await this.authService.login(email, password);
  const { access_token, refresh_token } = loginResponse;

  // Set the access token in the cookie
  res.cookie('token', access_token, {
    httpOnly: true, // Prevent client-side access
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Log for debugging
  console.log('Login successful:', loginResponse);

  // Return success response
  return {
    message: 'Login successfully',
    access_token,
  };
}

  @Post('/google/login')
  @UseGuards(GoogleOauthGuard)
  async googleLogin(@Req() req: any) {
    const { access_token, refresh_token } = await this.authService.googleLogin(
      req.user,
    );
    // res.cookie('token', 'Bearer ' + refresh_token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none',
    // });
    CreateLoginSuccessResponse('Login succesfull', access_token);
  }
}
