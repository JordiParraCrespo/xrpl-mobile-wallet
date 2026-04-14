import type { Queue } from 'bullmq';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UsersService } from '../../../users/services/users.service';
import { ForgotPasswordService } from '../forgot-password.service';

describe('ForgotPasswordService', () => {
  let service: ForgotPasswordService;
  let usersService: Pick<UsersService, 'findByEmail' | 'update'>;
  let emailQueue: Pick<Queue, 'add'>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
  };

  beforeEach(() => {
    usersService = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      update: vi.fn().mockResolvedValue(mockUser),
    };

    emailQueue = {
      add: vi.fn().mockResolvedValue(undefined),
    };

    service = new ForgotPasswordService(usersService as UsersService, emailQueue as Queue);
  });

  it('should enqueue password reset email for existing user', async () => {
    await service.execute('test@example.com');

    expect(usersService.update).toHaveBeenCalled();
    expect(emailQueue.add).toHaveBeenCalledWith('password-reset', {
      to: 'test@example.com',
      token: expect.any(String),
    });
  });

  it('should silently return if user not found', async () => {
    vi.mocked(usersService.findByEmail).mockResolvedValue(null);

    await service.execute('no@example.com');

    expect(emailQueue.add).not.toHaveBeenCalled();
  });
});
