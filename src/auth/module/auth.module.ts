import { Module } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/app/user/respository/userRepository';
import { UserService } from 'src/app/user/service/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ScUser } from 'src/common/entities/user.entity';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { RefreshJwtStrategy } from '../strategies/refresh-jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScUser
     
    ]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, UserRepository, JwtService,  JwtStrategy,
    RefreshJwtStrategy],
  exports: [],
})
export class AuthModule {}
