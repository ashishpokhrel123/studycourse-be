import { Module } from '@nestjs/common';
import { StorageController } from './file-upload-controller';

;


@Module({
  imports: [],
  controllers: [StorageController],
 
})
export class FileUploadModule {}
