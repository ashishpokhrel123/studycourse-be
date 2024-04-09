// import { Injectable, NotFoundException } from '@nestjs/common';
// import * as fs from 'fs/promises';
// import * as path from 'path';

// @Injectable()
// export class FileUploadService {
//   private readonly uploadDirectory: string;

//   constructor() {
//     this.uploadDirectory = path.join(__dirname, '..', '..', 'uploads');
//   }

//   async getFile(filePath: string) {
//     console.log(file)
//     try {
//       // Check if file exists
//       await fs.access(filePath, fs.constants.F_OK);

//       // Read file content and return
//       return fs.readFile(filePath);
//     } catch (error) {
//       // If file not found, throw NotFoundException
//       throw new NotFoundException('File not found');
//     }
//   }
// }
