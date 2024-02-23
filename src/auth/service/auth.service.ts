import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';
import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { UserRepository } from 'src/app/user/respository/userRepository';
import { RegisterDTO } from '../dto/auth.dto';

import {
  BadRequestErrorResponse,
  ConflictErrorResponse,
  CreateLoginSuccessResponse,
  CreateLogoutSuccessResponse,
  CreateSuccessResponse,
  ForbiddenErrorResponse,
  InternalServerErrorResponse,
} from 'src/common/response/response';
import { IGoogleLogin } from 'src/common/types/google-login.interface';
import { ScUser } from 'src/common/entities/user.entity';
import { response } from 'express';
import { emit } from 'process';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findUserByEmailWithPassword(email);
    if (!user || !user.password) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (match) {
      return user;
    }
    return null;
  }

  async getToken(payload: {
    email: string;
    id: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH,
        expiresIn: '7d',
      }),
    ]);
    return { access_token, refresh_token };
  }

  async register(body: RegisterDTO): Promise<any> {
    const doesEmailAlreadyExist = await this.userRepository.findUserByEmail(
      body.email,
    );
    if (doesEmailAlreadyExist)
      throw ConflictErrorResponse('Email already exits ');

    const user = await this.registerUserFromInput(body);
    const savedUser = await this.userRepository.createUser(user);
    if (savedUser) {
      CreateSuccessResponse('User created succesfully', savedUser);
    } else {
      throw InternalServerErrorResponse();
    }
  }

  async registerUserFromInput(body: RegisterDTO): Promise<any> {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      password,
      googleId,
    } = body;
    if (!(await this.isPasswordStrong(password))) {
      throw BadRequestErrorResponse('Password is weak');
    }

    const newUser = this.userRepository.createUser({
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      password: await this.passwordHashFunction(password),
      googleId: null,
    });

    return newUser;
  }

  private async isPasswordStrong(password: string): Promise<boolean> {
    const passwordRegex =
      /^.*(?=.{6,})(?=.*\d)(?=.*[a-zA-Z])(?=.*[@#$%^&+=]).*$/;
    return passwordRegex.test(password);
  }

  private async passwordHashFunction(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async getEmail(email: string): Promise<ScUser | null> {
    return this.userRepository.findUserByEmail(email);
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    return;
  }

  async logout(@Res({ passthrough: true }) response: any): Promise<any> {
    response.cookie('token', null),
      {
        httpOnly: true,
        secure: true,
      };
    CreateLogoutSuccessResponse('Logout successful');
  }

  /* login from google */
  async googleLogin(data) {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      gender,
      dateOfBirth,
      googleId,
    } = data;
    let user = await this.findUserByFields({ email, googleId });
    if (!user) {
      const userCreated = await this.register({
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        address,
        gender,
        googleId: googleId,
        password: null,
      });
      if (userCreated) {
        user = await this.userRepository.findUserByEmailAndRole(
          userCreated.email,
        );
      } else {
        throw ForbiddenErrorResponse(
          "`This email address hasn't been used to sign up with Google. Please ensure you are using the correct account.",
        );
      }
    }
    const { access_token, refresh_token } = await this.loginByGoogle(user);
    return { access_token, refresh_token };
  }

  async findUserByFields({
    email,
    googleId,
  }: IGoogleLogin): Promise<ScUser | null> {
    return await this.userRepository.findUserByFields({ email, googleId });
  }

  async loginByGoogle(user: { email: string; id: string }): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload = { email: user.email, id: user.id, o: origin };
    return this.getToken(payload);
  }

  async login(email, pass): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.validateUser(email, pass);
    if (user) {
      const payload = { email: user.email, id: user.id };
      return this.getToken(payload);
    }
  }
}
