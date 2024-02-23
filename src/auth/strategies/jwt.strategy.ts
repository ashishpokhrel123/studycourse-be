import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { ScUser } from 'src/common/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(ScUser)
    private readonly usersService: Repository<ScUser>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }
   async validate(ctx, payload) {
    const user = await this.usersService.findOne({
      where: { id: payload.id, email: payload.em },
    });
    return user;
  }
}

 

