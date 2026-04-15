import { changePasswordSchema } from "@flama/shared";
import { createZodDto } from "nestjs-zod";

export class ChangePasswordRequest extends createZodDto(changePasswordSchema) {}
