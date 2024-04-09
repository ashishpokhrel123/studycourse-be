import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../respository/userRepository';
import { RegisterUserDTO } from '../dto/create-user.dto';
import { ScUser } from 'src/common/entities/user.entity';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}
  async getProfile(userId: string): Promise<{
    status: number;
    message: string;
    data: {
      id:string;
      firstName: string;
      lastName: string;
      email: string;
      photoPath: string;
      gender: string;
      phone: string;
      role:string;
      lastActive: Date;
    };
  }> {
    const user = await this.userRepository.findUserById(userId);
    console.log(user, "user")

    const {id, firstName, lastName, email, photoPath, gender, phone, lastActive, role } = user;
    return {
      status: HttpStatus.OK,
      message: 'Profile fetech succesfully',
      data: {
        id: id ? id: null,
        firstName: firstName ? firstName : null,
        lastName: lastName ? lastName : null,
        email: email ? email : null,
        photoPath: photoPath ? photoPath : null,
        gender: gender ? gender : null,
        phone: phone ? phone : '',
        lastActive:lastActive ? lastActive :null,
        role: role ? role: null
      },
    };
  }

  async registerUser(register: RegisterUserDTO): Promise<{
    status: number;
    message: string;
  }> {
    const newUser = await this.userRepository.addUser(register);
    return newUser;
    
    
  }
   async fetchUser(): Promise<any> {
    const users = await this.userRepository.fetchUser();
    console.log(users, "users")
    return users;
    
    
  }

  async addUser(register: any): Promise<{
    status: number;
    message: string;
  }> {
  const newUser = await this.userRepository.addUser(register);
    return newUser;
    
    
  }

   async addNewUser(register: any): Promise<{
    status: number;
    message: string;
  }> {
    console.log(register, "register")
    const newUser = await this.userRepository.addNewUser(register.data);
    return newUser;
    
    
  }

    async fetchAllUser(): Promise<any> {
    const users = await this.userRepository.fetchAllUser();
    console.log(users, "users")
    return users;
    
    
  }
  
}
