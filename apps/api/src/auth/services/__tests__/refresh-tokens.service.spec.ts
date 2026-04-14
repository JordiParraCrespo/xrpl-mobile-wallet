import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserTokenService } from '../../../users/services/user-token.service';
import type { UsersService } from '../../../users/services/users.service';
import { AuthErrors } from '../../errors/auth.errors';
import { RefreshTokensService } from '../refresh-tokens.service';

describe('RefreshTokensService', () => {
  let service: RefreshTokensService;
  let usersService: Pick<UsersService, 'findById'>;
  let userTokenService: Pick<UserTokenService, 'validateRefreshToken' | 'generateAndStoreTokens'>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    role: 'user' as const,
  };

  beforeEach(() => {
    usersService = {
      findById: vi.fn().mockResolvedValue(mockUser),
    };

    userTokenService = {
      validateRefreshToken: vi.fn().mockResolvedValue(true),
      generateAndStoreTokens: vi.fn().mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    };

    service = new RefreshTokensService(
      usersService as UsersService,
      userTokenService as UserTokenService,
    );
  });

  it('should return new token pair on valid refresh', async () => {
    const result = await service.execute('user-uuid', 'old-refresh-token');

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(userTokenService.validateRefreshToken).toHaveBeenCalledWith(
      'user-uuid',
      'old-refresh-token',
    );
    expect(userTokenService.generateAndStoreTokens).toHaveBeenCalledWith(
      'user-uuid',
      'test@example.com',
      'user',
    );
  });

  it('should throw ACCESS_DENIED if refresh token is invalid', async () => {
    vi.mocked(userTokenService.validateRefreshToken).mockResolvedValue(false);

    await expect(service.execute('user-uuid', 'wrong-token')).rejects.toMatchObject({
      code: AuthErrors.ACCESS_DENIED.code,
    });
  });
});
