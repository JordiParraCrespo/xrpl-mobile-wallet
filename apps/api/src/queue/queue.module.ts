import { QUEUE_NAMES } from '@flama/shared';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmailProcessor } from './email.processor';
import { UserRegisteredListener } from './listeners/user-registered.listener';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_NAMES.EMAIL }),
    BullModule.registerQueue({ name: QUEUE_NAMES.FILE_PROCESSING }),
  ],
  providers: [EmailProcessor, UserRegisteredListener],
  exports: [BullModule],
})
export class QueueModule {}
