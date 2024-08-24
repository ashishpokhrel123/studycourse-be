import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RegisterDTO } from 'src/auth/dto/auth.dto';
import { IGoogleLogin } from 'src/common/types/google-login.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ScUser, UserRole } from 'src/common/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(ScUser)
    private readonly userRepository: Repository<ScUser>,
  ) {}

  async createUser(user: RegisterDTO): Promise<any> {
    const createdUser = this.userRepository.create(user);
    return await this.userRepository.save(createdUser);
  }

  async findUserByEmail(email: string): Promise<ScUser | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findUserById(id: string): Promise<ScUser | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findUserByFields({
    email,
    googleId,
  }: IGoogleLogin): Promise<ScUser | null> {
    return await this.userRepository.findOne({ where: { email, googleId } });
  }

  async findUserByEmailAndRole({ email }: any): Promise<ScUser | null> {
    return await this.userRepository.findOne({
      where: { email, role: UserRole.STUDENT },
    });
  }

  async findUserByEmailWithPassword(
    email: string,
  ): Promise<ScUser | any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
    console.log(user, "user")

    return user;
  }
  // this is api to saved user who want appoinemnt
  async addUser({
    firstName,
    middleName,
    lastName,
    email,
    phone,
    dateOfBirth,
    nationality,
    studyLevel,
    destination,
    counselingOption,
    termsAndConditionsAccepted,
  }): Promise<any> {
    const createdUser = this.userRepository.create({
      firstName,
      middleName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationality,
      studyLevel,
      destination,
      counselingOption,
      termsAndConditionsAccepted,
    });
    const addUser = await this.userRepository.save(createdUser);
    return {
      status: HttpStatus.CREATED,
      message: 'User registred successfully',
    };
  }

  //fetch user
  async fetchUser(): Promise<any> {
    try {
      const users = await this.userRepository.find({
        where: { role: UserRole.STUDENT },
      });
      return {
        status: HttpStatus.OK,
        message: 'Users fetched successfully',
        data: users,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch users',
        data: null,
      };
    }
  }

  async fetchAllUser(): Promise<{ status: number, message: string, data: ScUser[] | null } > {
    try {
      const users = await this.userRepository.find({
        where: { role: UserRole.ADMIN },
      });
      return {
        status: HttpStatus.OK,
        message: 'Users fetched successfully',
        data: users,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch users',
        data: null,
      };
    }
  }

  async addNewUser({
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender
  }): Promise<any> {
    const createdUser = this.userRepository.create({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender
    });
    const addUser = await this.userRepository.save(createdUser);
    return {
      status: HttpStatus.CREATED,
      message: 'User registred successfully',
    };
  }
}
