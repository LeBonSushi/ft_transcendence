// Shared Auth DTOs
export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  username: string;
  email: string;
  password: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
