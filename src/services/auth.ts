// MyLife OS: Neon Auth Service

const AUTH_BASE_URL = 'https://ep-royal-brook-aokk7v7o.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export class AuthService {
  private static jwtToken: string | null = localStorage.getItem('mylife_jwt');
  private static userProfile: UserProfile | null = (() => {
    try {
      const saved = localStorage.getItem('mylife_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  private static guestProfile: UserProfile | null = (() => {
    try {
      const saved = localStorage.getItem('mylife_guest');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  static isGuest(): boolean {
    return !!this.guestProfile;
  }

  static setGuest(): void {
    this.guestProfile = {
      id: 'guest',
      name: 'Offline Terminal',
      email: 'guest@mylife.local',
      role: 'guest',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('mylife_guest', JSON.stringify(this.guestProfile));
  }

  static clearGuest(): void {
    this.guestProfile = null;
    localStorage.removeItem('mylife_guest');
  }

  static getJwt(): string | null {
    return this.jwtToken;
  }

  static getUser(): UserProfile | null {
    return this.userProfile || this.guestProfile;
  }

  static isAuthenticated(): boolean {
    return (!!this.jwtToken && !!this.userProfile) || !!this.guestProfile;
  }

  /**
   * Fetch JWT token from Neon Auth using session cookie
   */
  static async refreshJwt(): Promise<string | null> {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/token`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.token) {
          this.jwtToken = data.token;
          localStorage.setItem('mylife_jwt', data.token);
          return data.token;
        }
      }
      return null;
    } catch (e) {
      console.error('Failed to fetch JWT token:', e);
      return null;
    }
  }

  /**
   * Register a new user
   */
  static async signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }

      if (data.user) {
        this.userProfile = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          createdAt: data.user.createdAt
        };
        localStorage.setItem('mylife_user', JSON.stringify(this.userProfile));
        
        await this.refreshJwt();
        return { success: true };
      }

      return { success: false, error: 'User data missing from response' };
    } catch (e: unknown) {
      console.error('Registration error:', e);
      return { success: false, error: e instanceof Error ? e.message : 'Connection error' };
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Invalid email or password' };
      }

      if (data.user) {
        this.userProfile = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          createdAt: data.user.createdAt
        };
        localStorage.setItem('mylife_user', JSON.stringify(this.userProfile));
        
        const token = await this.refreshJwt();
        return token ? { success: true } : { success: false, error: 'Failed to retrieve JWT' };
      }

      return { success: false, error: 'User data missing from response' };
    } catch (e: unknown) {
      console.error('Sign-in error:', e);
      return { success: false, error: e instanceof Error ? e.message : 'Connection error' };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<void> {
    try {
      this.clearGuest();
      await fetch(`${AUTH_BASE_URL}/sign-out`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Sign out request failed:', e);
    } finally {
      this.jwtToken = null;
      this.userProfile = null;
      localStorage.removeItem('mylife_jwt');
      localStorage.removeItem('mylife_user');
    }
  }

  /**
   * Check if a valid session exists in background
   */
  static async checkSession(): Promise<boolean> {
    if (this.guestProfile) {
      return true;
    }
    try {
      const res = await fetch(`${AUTH_BASE_URL}/get-session`, {
        method: 'GET',
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.session && data.user) {
          this.userProfile = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            createdAt: data.user.createdAt
          };
          localStorage.setItem('mylife_user', JSON.stringify(this.userProfile));
          await this.refreshJwt();
          return true;
        }
      }
      
      this.jwtToken = null;
      this.userProfile = null;
      localStorage.removeItem('mylife_jwt');
      localStorage.removeItem('mylife_user');
      return false;
    } catch (e) {
      console.error('Session check failed:', e);
      return false;
    }
  }
}
