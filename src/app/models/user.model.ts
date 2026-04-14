export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'tester' | 'viewer';
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthState {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
}
