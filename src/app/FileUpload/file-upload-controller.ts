import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { Response } from 'express';
import * as path from 'path';
import { Observable, of } from 'rxjs';



@Controller('uploads')
export class StorageController {
 

  @Post()
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${Date.now()}${ext}`);
        },
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadImage(
    @UploadedFile() imageFile: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (!imageFile) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'No file uploaded' });
      }

      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'File uploaded successfully', filename: imageFile.filename });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error uploading file' });
    }
  }

@Get('image/:imagename')
findImage(@Param('imagename') imagename: string, @Res() res: Response): void {
  const imagePath = path.join(process.cwd(), 'uploads', imagename);

  console.log(imagePath,"path")
  
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'File not found' });
    }
  });
}


  private handleFileError(error: any, res: Response): void {
    if (error instanceof NotFoundException) {
      res.status(HttpStatus.NOT_FOUND).send('File not found');
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error fetching file');
    }
  }
}


// Function for file type validation
function imageFileFilter(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('You can upload only image files!'), false);
  }
  cb(null, true);
}
