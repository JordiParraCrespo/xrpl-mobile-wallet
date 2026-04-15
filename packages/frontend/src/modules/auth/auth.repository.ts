import type { AuthResponseDto } from '@flama/api-client';
import { AuthApi } from '@flama/api-client';
import type { LoginDto, RegisterDto } from '@flama/shared';
import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AppError } from '../core/errors';
import type { IStorageService } from '../core/storage.service';
import { AuthErrors } from './auth.errors';

@injectable()
export class AuthRepository {
  constructor(@inject(TOKENS.StorageService) private readonly storage: IStorageService) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const data = await AuthApi.login(dto);
    if (!data) throw new AppError(AuthErrors.LOGIN_FAILED);
    await this.storage.set('accessToken', data.accessToken);
    await this.storage.set('refreshToken', data.refreshToken);
    return data;
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const data = await AuthApi.register(dto);
    if (!data) throw new AppError(AuthErrors.REGISTER_FAILED);
    await this.storage.set('accessToken', data.accessToken);
    await this.storage.set('refreshToken', data.refreshToken);
    return data;
  }

  async refresh(): Promise<AuthResponseDto> {
    const data = await AuthApi.refresh();
    if (!data) throw new AppError(AuthErrors.REFRESH_FAILED);
    await this.storage.set('accessToken', data.accessToken);
    await this.storage.set('refreshToken', data.refreshToken);
    return data;
  }

  async forgotPassword(email: string): Promise<void> {
    await AuthApi.forgotPassword({ email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await AuthApi.resetPassword({ token, password });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await AuthApi.changePassword({ currentPassword, newPassword });
  }

  async logout(): Promise<void> {
    await this.storage.remove('accessToken');
    await this.storage.remove('refreshToken');
  }
}
