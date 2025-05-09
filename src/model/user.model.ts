export class JwtPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

export class TokenResponse {
  access_token: string;
}

export class UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export class UserLoginRequest {
  email: string;
  password: string;
}

export class UserResponse {
  name: string;
  email: string;
}

export class UserUpdateRequest {
  id: number;
  name?: string;
  password?: string;
}
