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
import { FileUploadService } from './file-upload-service';
import { Response } from 'express';
import * as path from 'path';

@Controller('uploads')
export class StorageController {
  constructor(private readonly fileService: FileUploadService) {}

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

  @Get('/:fileName')
  async getFile(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const filePath = path.join('./uploads', fileName);
      console.log(filePath);
      const fileContent = await this.fileService.getFile(filePath);
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(fileContent);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).send('File not found');
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('Error fetching file');
      }
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
