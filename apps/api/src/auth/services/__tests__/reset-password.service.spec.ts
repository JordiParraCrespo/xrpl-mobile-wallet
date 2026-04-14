import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UsersService } from '../../../users/services/users.service';
import type { User } from '../../../users/user.entity';
import { AuthErrors } from '../../errors/auth.errors';
import { ResetPasswordService } from '../reset-password.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_new_password'),
}));

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;
  let usersService: Pick<UsersService, 'findByResetToken' | 'update'>;

  const mockUser = {
    id: 'user-uuid',
    resetPasswordExpires: new Date(Date.now() + 3600000),
  };

  beforeEach(() => {
    usersService = {
      findByResetToken: vi.fn().mockResolvedValue(mockUser),
      update: vi.fn().mockResolvedValue(mockUser),
    };

    service = new ResetPasswordService(usersService as UsersService);
  });

  it('should reset password with valid token', async () => {
    await service.execute('valid-token', 'newPassword123');

    expect(usersService.update).toHaveBeenCalledWith('user-uuid', {
      password: 'hashed_new_password',
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  });

  it('should throw INVALID_RESET_TOKEN if token not found', async () => {
    vi.mocked(usersService.findByResetToken).mockResolvedValue(null);

    await expect(service.execute('bad-token', 'newPassword123')).rejects.toMatchObject({
      code: AuthErrors.INVALID_RESET_TOKEN.code,
    });
  });

  it('should throw INVALID_RESET_TOKEN if token expired', async () => {
    vi.mocked(usersService.findByResetToken).mockResolvedValue({
      ...mockUser,
      resetPasswordExpires: new Date(Date.now() - 1000),
    } as unknown as User);

    await expect(service.execute('expired-token', 'newPassword123')).rejects.toMatchObject({
      code: AuthErrors.INVALID_RESET_TOKEN.code,
    });
  });
});
