import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserErrors } from '../../errors/user.errors';
import { UserDeletedEvent } from '../../events/user-deleted.event';
import type { User } from '../../user.entity';
import { DeleteUserService } from '../delete-user.service';

describe('DeleteUserService', () => {
  let service: DeleteUserService;
  let repo: Pick<Repository<User>, 'findOneBy' | 'remove'>;
  let eventEmitter: Pick<EventEmitter2, 'emit'>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
  };

  beforeEach(() => {
    repo = {
      findOneBy: vi.fn().mockResolvedValue(mockUser),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    eventEmitter = {
      emit: vi.fn(),
    };

    service = new DeleteUserService(repo as Repository<User>, eventEmitter as EventEmitter2);
  });

  it('should delete user and emit event', async () => {
    await service.execute('user-uuid');

    expect(repo.remove).toHaveBeenCalledWith(mockUser);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      UserDeletedEvent.eventName,
      expect.any(UserDeletedEvent),
    );
  });

  it('should throw NOT_FOUND if user does not exist', async () => {
    vi.mocked(repo.findOneBy).mockResolvedValue(null);

    await expect(service.execute('bad-uuid')).rejects.toMatchObject({
      code: UserErrors.NOT_FOUND.code,
    });
  });
});
