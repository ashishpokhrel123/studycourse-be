import { Module } from '@nestjs/common';

import { FileUploadService } from './file-upload-service';
import { StorageController } from './file-upload-controller';

@Module({
  imports: [],
  controllers: [StorageController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
