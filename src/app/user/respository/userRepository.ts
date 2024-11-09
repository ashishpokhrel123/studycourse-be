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

  async findUserByEmailWithPassword(email: string): Promise<ScUser | any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
    console.log(user, 'user');

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

  async fetchAllUser(): Promise<{
  status: number;
  message: string;
  data: ScUser[] | null;
}> {
  try {
    const users = await this.userRepository.find();
    
    // Filter out users with the role 'student'
    const filteredUsers = users.filter(user => user.role !== 'student');

    return {
      status: HttpStatus.OK,
      message: 'Users fetched successfully',
      data: filteredUsers,
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
  gender,
  role,
}): Promise<any> {
  // Check if the email already exists
  const existingUser = await this.userRepository.findOne({ where: { email } });
  if (existingUser) {
   if (existingUser) {
    throw new HttpException('Email already exists', HttpStatus.CONFLICT);
  }
  }

  const createdUser = this.userRepository.create({
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    role,
  });

  await this.userRepository.save(createdUser);
  
  return {
    status: HttpStatus.CREATED,
    message: 'User registered successfully',
  };
}


  async fetchUserById(
    id: string,
  ): Promise<{ status: number; message: string; data: ScUser | null }> {
    try {
      const user = await this.findUserById(id);
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
          data: null,
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'User fetched successfully',
        data: user,
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch user',
        data: null,
      };
    }
  }

  async updateUserRole(
    id: string,
    role: any,
  ): Promise<{ status: number; message: string }> {
    try {
      const user = await this.findUserById(id);
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }
      user.role = role;
      await this.userRepository.save(user);
      return {
        status: HttpStatus.OK,
        message: 'User role updated successfully',
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update user role',
      };
    }
  }

  async updateUser(
    id: string,
    updateData: any,
  ): Promise<{ status: number; message: string }> {
    try {
      const user = await this.findUserById(id);
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      console.log(updateData, 'updateduser');

      // Ensure the role is valid if it's being updated
      if (
        updateData.role &&
        !Object.values(UserRole).includes(updateData.role)
      ) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid user role',
        };
      }

      // Update user properties
      Object.assign(user, updateData);
      console.log(user, 'user');
      await this.userRepository.save(user);

      return {
        status: HttpStatus.OK,
        message: 'User updated successfully',
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update user',
      };
    }
  }
}
