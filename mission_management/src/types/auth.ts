export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  // role isn't user selectable in this flow; backend will assign 'observer'
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

export interface RegisterResponse {
  accessToken: string;
  user: AuthUser; // role will be 'observer'
}

export interface MeResponse {
  user: AuthUser;
}
