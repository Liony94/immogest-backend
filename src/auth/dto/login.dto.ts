import { UserRole } from '../../common/types';

export class LoginDto {
  email: string;
  password: string;
  role: UserRole;
} 