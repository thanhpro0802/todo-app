export type SubscriptionTier = 'free' | 'premium' | 'team';
export type Language = 'en' | 'vi' | 'fr' | 'es' | 'de';

export interface UserPreferences {
  timezone: string;
  language: Language;
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  pushNotifications: boolean;
  weekStartsOn: 0 | 1; // 0 for Sunday, 1 for Monday
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  timezone: string;
  language: Language;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  timezone?: string;
  language?: Language;
  preferences?: Partial<UserPreferences>;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}