export class JwtPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

export class TokenResponse {
  access_token: string;
}
