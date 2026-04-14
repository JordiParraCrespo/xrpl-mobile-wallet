import { AppError } from '@flama/backend-core';
import type { UpdateUserDto } from '@flama/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { UserErrors } from '../errors/user.errors';
import { User } from '../user.entity';

@Injectable()
export class UpdateUserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new AppError(UserErrors.NOT_FOUND);

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }
}
