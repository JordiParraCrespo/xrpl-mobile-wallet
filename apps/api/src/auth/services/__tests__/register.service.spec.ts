import { AppError } from '@flama/backend-core';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserTokenService } from '../../../users/services/user-token.service';
import type { UsersService } from '../../../users/services/users.service';
import type { User } from '../../../users/user.entity';
import { AuthErrors } from '../../errors/auth.errors';
import { UserRegisteredEvent } from '../../events/user-registered.event';
import { RegisterService } from '../register.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_value'),
}));

describe('RegisterService', () => {
  let service: RegisterService;
  let usersService: Pick<UsersService, 'findByEmail' | 'create'>;
  let userTokenService: Pick<UserTokenService, 'generateAndStoreTokens'>;
  let eventEmitter: Pick<EventEmitter2, 'emit'>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user' as const,
  };

  beforeEach(() => {
    usersService = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(mockUser),
    };

    userTokenService = {
      generateAndStoreTokens: vi.fn().mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    };

    eventEmitter = {
      emit: vi.fn(),
    };

    service = new RegisterService(
      usersService as UsersService,
      userTokenService as UserTokenService,
      eventEmitter as EventEmitter2,
    );
  });

  it('should register a new user and return tokens', async () => {
    const result = await service.execute({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(usersService.create).toHaveBeenCalled();
    expect(userTokenService.generateAndStoreTokens).toHaveBeenCalledWith(
      'user-uuid',
      'test@example.com',
      'user',
    );
  });

  it('should emit UserRegisteredEvent after registration', async () => {
    await service.execute({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      UserRegisteredEvent.eventName,
      expect.any(UserRegisteredEvent),
    );
  });

  it('should throw EMAIL_ALREADY_IN_USE if email exists', async () => {
    vi.mocked(usersService.findByEmail).mockResolvedValue(mockUser as unknown as User);

    await expect(
      service.execute({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      }),
    ).rejects.toThrow(AppError);

    await expect(
      service.execute({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      }),
    ).rejects.toMatchObject({
      code: AuthErrors.EMAIL_ALREADY_IN_USE.code,
    });
  });
});
