import { QUEUE_NAMES } from '@flama/shared';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { Queue } from 'bullmq';
import { UserRegisteredEvent } from '../../auth/events/user-registered.event';

@Injectable()
export class UserRegisteredListener {
  constructor(@InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue) {}

  @OnEvent(UserRegisteredEvent.eventName)
  async handleUserRegistered(event: UserRegisteredEvent) {
    await this.emailQueue.add('welcome', {
      to: event.email,
      name: event.firstName,
    });
  }
}
