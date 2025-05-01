import { z, ZodType } from 'zod';
import {
  UserLoginRequest,
  UserRegisterRequest,
  UserUpdateRequest,
} from '../model/user.model';

export class UserValidation {
  static readonly REGISTER: ZodType<UserRegisterRequest> = z.object({
    name: z.string().min(1).max(100),
    email: z.string().min(1).max(100).email(),
    password: z.string().min(1).max(100),
    role: z.string().min(1).max(50).optional(),
  });

  static readonly LOGIN: ZodType<UserLoginRequest> = z.object({
    email: z.string().min(1).max(100).email(),
    password: z.string().min(1).max(100),
  });

  static readonly UPDATE: ZodType<UserUpdateRequest> = z.object({
    id: z.number().min(1).positive(),
    name: z.string().min(1).max(100).optional(),
    password: z.string().min(1).max(100).optional(),
  });
}
