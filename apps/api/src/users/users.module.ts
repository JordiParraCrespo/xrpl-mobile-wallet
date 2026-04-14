import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteUserService } from './services/delete-user.service';
import { UpdateUserService } from './services/update-user.service';
import { UserTokenService } from './services/user-token.service';
import { UsersService } from './services/users.service';
import { User } from './user.entity';
import { UserMapper } from './user.mapper';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, UserTokenService, UpdateUserService, DeleteUserService, UserMapper],
  exports: [UsersService, UserTokenService, TypeOrmModule],
})
export class UsersModule {}
