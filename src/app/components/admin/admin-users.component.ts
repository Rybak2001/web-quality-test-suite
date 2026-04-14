import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatChipsModule],
  template: `
    <div class="admin-content">
      <div class="page-header">
        <h1>User Management</h1>
        <span class="user-count">{{ users.length }} users</span>
      </div>
      <mat-card>
        <mat-card-content>
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users; track user.id) {
                <tr>
                  <td><strong>{{ user.name }}</strong></td>
                  <td>{{ user.email }}</td>
                  <td>
                    <mat-form-field appearance="outline" class="role-select">
                      <mat-select [value]="user.role" (selectionChange)="changeRole(user.id, $event.value)">
                        <mat-option value="admin">Admin</mat-option>
                        <mat-option value="tester">Tester</mat-option>
                        <mat-option value="viewer">Viewer</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>{{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}</td>
                  <td>
                    <button mat-icon-button color="warn" (click)="deleteUser(user.id, user.name)" [disabled]="user.role === 'admin' && adminCount <= 1">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-content { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .page-header h1 { color: #1a237e; margin: 0; }
    .user-count { background: #e8eaf6; color: #1a237e; padding: 4px 12px; border-radius: 16px; font-size: 0.85rem; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px; background: #e8eaf6; color: #1a237e; font-size: 0.85rem; }
    .data-table td { padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: middle; }
    .role-select { width: 120px; font-size: 0.85rem; }
    .role-select ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: Omit<User, 'password'>[] = [];
  adminCount = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users = this.authService.getAllUsers();
    this.adminCount = this.users.filter(u => u.role === 'admin').length;
  }

  changeRole(userId: string, role: User['role']): void {
    this.authService.updateUserRole(userId, role);
    this.loadUsers();
  }

  deleteUser(userId: string, name: string): void {
    if (confirm(`Delete user "${name}"?`)) {
      this.authService.deleteUser(userId);
      this.loadUsers();
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
