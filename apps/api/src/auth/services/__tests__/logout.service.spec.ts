import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserTokenService } from '../../../users/services/user-token.service';
import { LogoutService } from '../logout.service';

describe('LogoutService', () => {
  let service: LogoutService;
  let userTokenService: Pick<UserTokenService, 'revokeRefreshToken'>;

  beforeEach(() => {
    userTokenService = {
      revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
    };

    service = new LogoutService(userTokenService as UserTokenService);
  });

  it('should revoke the refresh token', async () => {
    await service.execute('user-uuid');

    expect(userTokenService.revokeRefreshToken).toHaveBeenCalledWith('user-uuid');
  });
});
