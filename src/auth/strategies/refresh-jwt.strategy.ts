import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ScUser } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(
    @InjectRepository(ScUser)
    private readonly usersService: Repository<ScUser>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshJwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_REFRESH,
      passReqToCallback: true,
    });
  }

 

  private static extractJWT(req: Request): string | null {
    if (req.cookies && req.cookies.token?.length > 0) {
      const token = req.cookies.token.split('Bearer ');
      return token[1];
    }
    return null;
  }
}
