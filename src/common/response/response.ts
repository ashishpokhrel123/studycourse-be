import { HttpStatus } from '@nestjs/common';


interface Response {
  status: string;
  message: string;
  data?: any;
}

interface LoginResponse {
  status: string;
  message: string;
  access_token?: any;

}

const loginResponse = (status: number, message: string, access_token?: any): LoginResponse => {
  return {
    status: status.toString(), 
    message,
    access_token,
  };
};


const createResponse = (status: number, message: string, data?: any): Response => {
  return {
    status: status.toString(), 
    message,
    data,
  };
};

//login success response
export const CreateLoginSuccessResponse = (message: string, access_token?: any):LoginResponse => {
  return loginResponse(HttpStatus.OK, message,access_token);
}

//logout success response
export const CreateLogoutSuccessResponse = (message: string, access_token?: any):LoginResponse => {
  return loginResponse(HttpStatus.OK, message,access_token);
}

// Success Response
export const CreateSuccessResponse = (message: string, data?: any): Response => {
  return createResponse(HttpStatus.CREATED, message, data);
};

export const GetResponse = (message: string, data: any): Response => {
  return createResponse(HttpStatus.OK, message, data);
};

export const getPaginateResponse = (message: string, data: any, meta: any): Response => {
  return createResponse(HttpStatus.OK, message, { items: data, meta });
};

export const UpdateResponse = (message: string, data: any): Response => {
  return createResponse(HttpStatus.OK, message, data);
};

export const DeleteResponse = (message: string): Response => {
  return createResponse(HttpStatus.OK, message);
};

// Error Response
export const createErrorResponse = (status: number, message?: string): Response => {
  return createResponse(status, message);
};

export const BadRequestErrorResponse = (message: string): Response => {
  return createErrorResponse(HttpStatus.BAD_REQUEST, message);
};

export const InternalServerErrorResponse = (): Response => {
  return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR);
};

export const ConflictErrorResponse = (message: string): Response => {
  return createErrorResponse(HttpStatus.CONFLICT, message);
};

export const ForbiddenErrorResponse = (message: string): Response => {
  return createErrorResponse(HttpStatus.FORBIDDEN, message);
};
