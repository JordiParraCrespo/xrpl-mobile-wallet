import type { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserErrors } from '../../errors/user.errors';
import type { User } from '../../user.entity';
import { UpdateUserService } from '../update-user.service';

describe('UpdateUserService', () => {
  let service: UpdateUserService;
  let repo: Pick<Repository<User>, 'findOneBy' | 'save'>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(() => {
    repo = {
      findOneBy: vi.fn().mockResolvedValue(mockUser),
      save: vi.fn().mockImplementation((user) => Promise.resolve(user)),
    };

    service = new UpdateUserService(repo as Repository<User>);
  });

  it('should update and return the user', async () => {
    const result = await service.execute('user-uuid', {
      firstName: 'Updated',
    });

    expect(result.firstName).toBe('Updated');
    expect(repo.save).toHaveBeenCalled();
  });

  it('should throw NOT_FOUND if user does not exist', async () => {
    vi.mocked(repo.findOneBy).mockResolvedValue(null);

    await expect(service.execute('bad-uuid', { firstName: 'Updated' })).rejects.toMatchObject({
      code: UserErrors.NOT_FOUND.code,
    });
  });
});
