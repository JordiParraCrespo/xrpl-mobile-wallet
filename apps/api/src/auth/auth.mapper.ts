import { Injectable } from '@nestjs/common';
import type { User } from '../users/user.entity';
import { ProfileResponseDto } from './dtos/profile-response.dto';

@Injectable()
export class AuthMapper {
  toProfileResponse(entity: User): ProfileResponseDto {
    const dto = new ProfileResponseDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.role = entity.role;
    dto.provider = entity.provider;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
