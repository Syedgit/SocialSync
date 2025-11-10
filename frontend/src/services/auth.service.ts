import api from './api';

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number | string; // Backend returns number, but we accept both for compatibility
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    console.log('📡 AuthService: Making login API call...', { email: data.email });
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      console.log('✅ AuthService: Login API response received', {
        hasAccessToken: !!response.data.accessToken,
        hasUser: !!response.data.user,
        userEmail: response.data.user?.email
      });
      
      if (response.data.accessToken && response.data.user) {
        // Save to localStorage
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Verify it was saved
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('💾 AuthService: Saved to localStorage', {
          tokenSaved: !!savedToken,
          tokenLength: savedToken?.length,
          userSaved: !!savedUser,
          userParsed: savedUser ? JSON.parse(savedUser).email : null
        });
      } else {
        console.error('❌ AuthService: Missing accessToken or user in response');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ AuthService: Login API error', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigation is handled by the component calling logout
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

