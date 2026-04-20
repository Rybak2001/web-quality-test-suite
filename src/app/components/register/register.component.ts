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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <div class="auth-header">
          <mat-icon class="auth-icon">science</mat-icon>
          <h1>Create Account</h1>
          <p>Join Web Quality Test Suite</p>
        </div>
        @if (error) {
          <div class="error-msg">{{ error }}</div>
        }
        <form (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput type="text" [(ngModel)]="name" name="name" required>
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" name="email" required>
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required minlength="6">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" class="full-width submit-btn" [disabled]="!name || !email || !password">
            Create Account
          </button>
        </form>
        <div class="auth-footer">
          <span>Already have an account?</span>
          <a routerLink="/login">Sign In</a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #3b2f8a 0%, #5b4fc7 50%, #7c6dd8 100%); }
    .auth-card { width: 100%; max-width: 420px; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .auth-icon { font-size: 48px; width: 48px; height: 48px; color: #5b4fc7; }
    .auth-header h1 { margin: 8px 0 4px; font-size: 1.5rem; color: #5b4fc7; }
    .auth-header p { color: #6b7280; margin: 0; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: 1rem; margin-top: 8px; border-radius: 10px !important; }
    .error-msg { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 10px; margin-bottom: 16px; text-align: center; border: 1px solid #fecaca; }
    .auth-footer { text-align: center; margin-top: 20px; }
    .auth-footer a { color: #5b4fc7; font-weight: 600; margin-left: 4px; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  error = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }
    const result = this.auth.register(this.name, this.email, this.password);
    if (result.success) {
      this.router.navigate(['/']);
    } else {
      this.error = result.error || 'Registration failed';
    }
  }
}
