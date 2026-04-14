import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <div class="auth-header">
          <mat-icon class="auth-icon">science</mat-icon>
          <h1>Web Quality Test Suite</h1>
          <p>Sign in to your account</p>
        </div>
        @if (error) {
          <div class="error-msg">{{ error }}</div>
        }
        <form (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" name="email" required>
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required>
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" class="full-width submit-btn" [disabled]="!email || !password">
            Sign In
          </button>
        </form>
        <div class="auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/register">Register</a>
        </div>
        <div class="demo-credentials">
          <p><strong>Demo credentials:</strong></p>
          <p>Admin: admin&#64;qualitysuite.com / admin123</p>
          <p>Tester: tester&#64;qualitysuite.com / tester123</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%); }
    .auth-card { width: 100%; max-width: 420px; padding: 40px; border-radius: 12px; }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .auth-icon { font-size: 48px; width: 48px; height: 48px; color: #1a237e; }
    .auth-header h1 { margin: 8px 0 4px; font-size: 1.5rem; color: #1a237e; }
    .auth-header p { color: #666; margin: 0; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: 1rem; margin-top: 8px; }
    .error-msg { background: #ffebee; color: #c62828; padding: 12px; border-radius: 8px; margin-bottom: 16px; text-align: center; }
    .auth-footer { text-align: center; margin-top: 20px; }
    .auth-footer a { color: #1a237e; font-weight: 600; margin-left: 4px; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }
    .demo-credentials { margin-top: 20px; padding: 12px; background: #e8eaf6; border-radius: 8px; font-size: 0.85rem; }
    .demo-credentials p { margin: 2px 0; color: #333; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    const result = this.auth.login(this.email, this.password);
    if (result.success) {
      this.router.navigate(['/']);
    } else {
      this.error = result.error || 'Login failed';
    }
  }
}
