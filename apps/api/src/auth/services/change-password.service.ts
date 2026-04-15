import { AppError } from "@flama/backend-core";
import { AUTH } from "@flama/shared";
import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UsersService } from "../../users/services/users.service";
import { AuthErrors } from "../errors/auth.errors";

@Injectable()
export class ChangePasswordService {
  constructor(private readonly usersService: UsersService) {}

  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.usersService.findById(userId);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError(AuthErrors.INVALID_CREDENTIALS);
    }

    const hashedPassword = await bcrypt.hash(newPassword, AUTH.SALT_ROUNDS);
    await this.usersService.update(userId, { password: hashedPassword });
  }
}
