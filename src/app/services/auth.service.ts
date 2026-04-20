import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, AuthState } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'wqts_auth';
  private readonly USERS_KEY = 'wqts_users';
  private readonly RATE_KEY = 'wqts_login_attempts';

  private authState$ = new BehaviorSubject<AuthState>({ user: null, isAuthenticated: false });

  // Rate limiting state
  loginBlocked = false;
  blockCountdown = 0;
  private blockTimer: any = null;

  constructor() {
    this.initDefaultUsers();
    this.restoreSession();
    this.checkRateLimit();
  }

  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  getCurrentUser(): Omit<User, 'password'> | null {
    return this.authState$.getValue().user;
  }

  isAuthenticated(): boolean {
    return this.authState$.getValue().isAuthenticated;
  }

  isAdmin(): boolean {
    return this.authState$.getValue().user?.role === 'admin';
  }

  login(email: string, password: string): { success: boolean; error?: string } {
    if (this.loginBlocked) {
      return { success: false, error: `Demasiados intentos. Intente de nuevo en ${this.blockCountdown} segundos.` };
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      this.recordFailedAttempt();
      return { success: false, error: 'Invalid email or password' };
    }
    this.clearAttempts();
    user.lastLogin = new Date();
    this.saveUsers(users);
    const { password: _, ...safeUser } = user;
    this.authState$.next({ user: safeUser, isAuthenticated: true });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safeUser));
    return { success: true };
  }

  register(name: string, email: string, password: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role: 'viewer',
      createdAt: new Date()
    };
    users.push(newUser);
    this.saveUsers(users);
    const { password: _, ...safeUser } = newUser;
    this.authState$.next({ user: safeUser, isAuthenticated: true });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safeUser));
    return { success: true };
  }

  logout(): void {
    this.authState$.next({ user: null, isAuthenticated: false });
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Admin methods
  getAllUsers(): Omit<User, 'password'>[] {
    return this.getUsers().map(({ password, ...u }) => u);
  }

  updateUserRole(userId: string, role: User['role']): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    user.role = role;
    this.saveUsers(users);
    return true;
  }

  deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    users.splice(idx, 1);
    this.saveUsers(users);
    return true;
  }

  private getUsers(): User[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      this.authState$.next({ user, isAuthenticated: true });
    }
  }

  private initDefaultUsers(): void {
    if (this.getUsers().length > 0) return;
    const defaults: User[] = [
      {
        id: crypto.randomUUID(), name: 'Administrador', email: 'admin@qualitysuite.com',
        password: 'admin123', role: 'admin', createdAt: new Date()
      },
      {
        id: crypto.randomUUID(), name: 'Carlos Tester', email: 'tester@qualitysuite.com',
        password: 'tester123', role: 'tester', createdAt: new Date()
      },
      {
        id: crypto.randomUUID(), name: 'María Viewer', email: 'viewer@qualitysuite.com',
        password: 'viewer123', role: 'viewer', createdAt: new Date()
      }
    ];
    this.saveUsers(defaults);
  }

  private recordFailedAttempt(): void {
    const now = Date.now();
    const cutoff = now - 60000;
    const raw = localStorage.getItem(this.RATE_KEY);
    let attempts: number[] = raw ? JSON.parse(raw) : [];
    attempts = attempts.filter(t => t > cutoff);
    attempts.push(now);
    localStorage.setItem(this.RATE_KEY, JSON.stringify(attempts));
    if (attempts.length >= 5) {
      this.startBlock(Math.ceil((attempts[0] + 60000 - now) / 1000));
    }
  }

  private clearAttempts(): void {
    localStorage.removeItem(this.RATE_KEY);
    this.loginBlocked = false;
    this.blockCountdown = 0;
    if (this.blockTimer) { clearInterval(this.blockTimer); this.blockTimer = null; }
  }

  private checkRateLimit(): void {
    const raw = localStorage.getItem(this.RATE_KEY);
    if (!raw) return;
    const now = Date.now();
    const cutoff = now - 60000;
    const attempts: number[] = JSON.parse(raw).filter((t: number) => t > cutoff);
    if (attempts.length >= 5) {
      this.startBlock(Math.ceil((attempts[0] + 60000 - now) / 1000));
    }
  }

  private startBlock(seconds: number): void {
    this.loginBlocked = true;
    this.blockCountdown = seconds;
    if (this.blockTimer) clearInterval(this.blockTimer);
    this.blockTimer = setInterval(() => {
      this.blockCountdown--;
      if (this.blockCountdown <= 0) {
        this.clearAttempts();
      }
    }, 1000);
  }
}
