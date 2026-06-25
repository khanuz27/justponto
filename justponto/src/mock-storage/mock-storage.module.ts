import { Module } from '@nestjs/common';
import { MockStorageController } from './mock-storage.controller';
import { StorageMockService } from '../data/mock/storage.mock.service';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule],
  controllers: [MockStorageController],
})
export class MockStorageModule {}
