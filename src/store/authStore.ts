import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  UpdateProfileData,
  ResetPasswordData,
  ChangePasswordData,
  UserPreferences
} from '../types/User';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => void;
}

type AuthStore = AuthState & AuthActions;

// Default user preferences
const defaultPreferences: UserPreferences = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: 'vi',
  theme: 'light',
  emailNotifications: true,
  pushNotifications: true,
  weekStartsOn: 1,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
};

// Mock API functions (replace with real API calls)
const mockApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === 'admin@todo.com' && credentials.password === 'password123') {
      const user: User = {
        id: '1',
        email: credentials.email,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        timezone: defaultPreferences.timezone,
        language: 'vi',
        emailVerified: true,
        twoFactorEnabled: false,
        subscriptionTier: 'premium',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        preferences: defaultPreferences,
      };
      
      const tokens: AuthTokens = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      };
      
      return { user, tokens };
    }
    
    throw new Error('Email hoặc mật khẩu không đúng');
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (data.email === 'existing@todo.com') {
      throw new Error('Email đã được sử dụng');
    }
    
    const user: User = {
      id: Date.now().toString(),
      email: data.email,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      timezone: defaultPreferences.timezone,
      language: 'vi',
      emailVerified: false,
      twoFactorEnabled: false,
      subscriptionTier: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      preferences: defaultPreferences,
    };
    
    const tokens: AuthTokens = {
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };
    
    return { user, tokens };
  },
  
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      accessToken: 'mock-access-token-refreshed-' + Date.now(),
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  },
  
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // This would update the user profile on the server
    console.log('Profile update data:', data);
    throw new Error('Profile update not implemented');
  },
  
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // This would change password on the server
    console.log('Password change data:', data);
    throw new Error('Password change not implemented');
  },
  
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // This would send reset email
    console.log('Password reset email sent to:', data.email);
  },
  
  verifyEmail: async (token: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // This would verify email with token
    console.log('Email verified with token:', token);
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await mockApi.login(credentials);
          
          // Store tokens in cookies if remember me is enabled
          if (credentials.rememberMe) {
            Cookies.set('refreshToken', response.tokens.refreshToken, { 
              expires: 30, // 30 days
              secure: true,
              sameSite: 'strict'
            });
          }
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
          });
          throw error;
        }
      },
      
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await mockApi.register(data);
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Đăng ký thất bại',
          });
          throw error;
        }
      },
      
      logout: () => {
        // Clear cookies
        Cookies.remove('refreshToken');
        
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }
        
        try {
          const newTokens = await mockApi.refreshToken(tokens.refreshToken);
          set({ tokens: newTokens });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },
      
      updateProfile: async (data: UpdateProfileData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await mockApi.updateProfile(data);
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Cập nhật thất bại',
          });
          throw error;
        }
      },
      
      changePassword: async (data: ChangePasswordData) => {
        set({ isLoading: true, error: null });
        try {
          await mockApi.changePassword(data);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Đổi mật khẩu thất bại',
          });
          throw error;
        }
      },
      
      resetPassword: async (data: ResetPasswordData) => {
        set({ isLoading: true, error: null });
        try {
          await mockApi.resetPassword(data);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Gửi email thất bại',
          });
          throw error;
        }
      },
      
      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          await mockApi.verifyEmail(token);
          const { user } = get();
          if (user) {
            set({
              user: { ...user, emailVerified: true },
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Xác thực email thất bại',
          });
          throw error;
        }
      },
      
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      checkAuthStatus: () => {
        const { tokens } = get();
        if (tokens && tokens.expiresAt > new Date()) {
          set({ isAuthenticated: true });
        } else {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);