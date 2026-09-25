export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  userEmailId: string;
  bio?: string;
  artistName?: string;
}

export interface AppUser {
  userId: number;
  username: string;
  bio?: string;
  profilePicUrl?: string;
  artistName?: string;
  userEmailId: string;
  stat: boolean;
  createdDttm: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  user: AppUser;
}

export interface GoogleLoginRequest {
  idToken: string;
}