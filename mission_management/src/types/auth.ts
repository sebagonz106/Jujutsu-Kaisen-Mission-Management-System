export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  role: 'sorcerer' | 'support' | 'observer';
  name: string;
  rank?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}
