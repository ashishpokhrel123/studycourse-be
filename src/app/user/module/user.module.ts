import { Module } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { UserRepository } from '../respository/userRepository';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { AuthService } from 'src/auth/service/auth.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScUser } from 'src/common/entities/user.entity';
// import { UserRepository } from '../respository/userRepository';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from 'src/common/entities/user.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([ScUser]),
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '1h' } }),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtStrategy, JwtAuthGuard, AuthService],
  exports:[]
})
export class UserModule {}
