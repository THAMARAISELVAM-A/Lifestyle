// MyLife OS: Neon Auth Service


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
      // Simulate JWT refresh from local DB / session
      const token = localStorage.getItem('mylife_jwt');
      if (token) {
        this.jwtToken = token;
        return token;
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
      // Mock Sign up for Sandbox/Offline mode
      const mockId = `usr_${Math.random().toString(36).substring(2, 10)}`;
      const user = {
        id: mockId,
        name,
        email,
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      
      this.userProfile = user;
      localStorage.setItem('mylife_user', JSON.stringify(user));
      
      const mockToken = `jwt_${mockId}_${Date.now()}`;
      this.jwtToken = mockToken;
      localStorage.setItem('mylife_jwt', mockToken);
      
      // Store in a local mock DB so signIn works later
      const users = JSON.parse(localStorage.getItem('mylife_mock_users') || '{}');
      users[email] = { ...user, password };
      localStorage.setItem('mylife_mock_users', JSON.stringify(users));

      return { success: true };
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
      // Mock Sign In for Sandbox/Offline mode
      const users = JSON.parse(localStorage.getItem('mylife_mock_users') || '{}');
      
      // Auto-provision sandbox admin if they use the default credentials
      if (email === 'admin@gmail.com' && password === 'admin@123' && !users[email]) {
        users[email] = {
          id: 'usr_sandbox_admin',
          name: 'System Admin',
          email: 'admin@gmail.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          password: 'admin@123'
        };
        localStorage.setItem('mylife_mock_users', JSON.stringify(users));
      }

      const user = users[email];

      if (!user || user.password !== password) {
        return { success: false, error: 'Invalid email or password' };
      }

      const { password: _, ...userProfile } = user;
      this.userProfile = userProfile;
      localStorage.setItem('mylife_user', JSON.stringify(this.userProfile));
      
      const mockToken = `jwt_${userProfile.id}_${Date.now()}`;
      this.jwtToken = mockToken;
      localStorage.setItem('mylife_jwt', mockToken);

      return { success: true };
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
      // Mock Sign Out
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
      // Mock Check Session
      const savedUser = localStorage.getItem('mylife_user');
      const savedToken = localStorage.getItem('mylife_jwt');
      
      if (savedUser && savedToken) {
        this.userProfile = JSON.parse(savedUser);
        this.jwtToken = savedToken;
        return true;
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
