import { QUEUE_NAMES } from '@flama/shared';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';

import { ForgotPasswordService } from './services/forgot-password.service';
import { LoginService } from './services/login.service';
import { LogoutService } from './services/logout.service';
import { RefreshTokensService } from './services/refresh-tokens.service';
import { RegisterService } from './services/register.service';
import { ResetPasswordService } from './services/reset-password.service';
import { ValidateOAuthService } from './services/validate-oauth.service';
import { GitHubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
    BullModule.registerQueue({ name: QUEUE_NAMES.EMAIL }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterService,
    LoginService,
    RefreshTokensService,
    LogoutService,
    ForgotPasswordService,
    ResetPasswordService,
    ValidateOAuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    GoogleStrategy,
    GitHubStrategy,
  ],
})
export class AuthModule {}
