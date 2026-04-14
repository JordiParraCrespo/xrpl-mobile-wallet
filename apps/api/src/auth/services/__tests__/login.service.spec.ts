import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserTokenService } from '../../../users/services/user-token.service';
import type { UsersService } from '../../../users/services/users.service';
import { AuthErrors } from '../../errors/auth.errors';
import { LoginService } from '../login.service';

vi.mock('bcrypt', () => ({
  compare: vi.fn().mockResolvedValue(true),
}));

describe('LoginService', () => {
  let service: LoginService;
  let usersService: Pick<UsersService, 'findByEmail'>;
  let userTokenService: Pick<UserTokenService, 'generateAndStoreTokens'>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    password: 'hashed_password',
    role: 'user' as const,
  };

  beforeEach(() => {
    usersService = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
    };

    userTokenService = {
      generateAndStoreTokens: vi.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    };

    service = new LoginService(usersService as UsersService, userTokenService as UserTokenService);
  });

  it('should return tokens on valid credentials', async () => {
    const result = await service.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(userTokenService.generateAndStoreTokens).toHaveBeenCalledWith(
      'user-uuid',
      'test@example.com',
      'user',
    );
  });

  it('should throw INVALID_CREDENTIALS if user not found', async () => {
    vi.mocked(usersService.findByEmail).mockResolvedValue(null);

    await expect(
      service.execute({ email: 'no@example.com', password: 'pass' }),
    ).rejects.toMatchObject({
      code: AuthErrors.INVALID_CREDENTIALS.code,
    });
  });

  it('should throw INVALID_CREDENTIALS if password mismatch', async () => {
    const bcrypt = await import('bcrypt');
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.execute({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({
      code: AuthErrors.INVALID_CREDENTIALS.code,
    });
  });
});
