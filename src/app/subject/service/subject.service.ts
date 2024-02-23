// import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { isEmpty } from 'class-validator';
// import slugify from 'slugify';

// @Injectable()
// export class SubjectService {
//   constructor(private readonly subjectRepository: CourseRepository) {}


  
//   async getSubjectByCourse(course: string): Promise<any> {
//     try {
//       if (isEmpty(course))
//         throw new HttpException(
//           'Course parameter is required.',
//           HttpStatus.BAD_REQUEST,
//         );
//       return this.subjectRepository.fetchSubjectByCourse(course);
//     } catch (error) {}
//   }
// }
