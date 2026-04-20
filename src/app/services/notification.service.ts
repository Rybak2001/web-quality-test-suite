import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new BehaviorSubject<AppNotification[]>([]);
  private activity$ = new BehaviorSubject<ActivityEntry[]>([]);

  getNotifications(): Observable<AppNotification[]> {
    return this.notifications$.asObservable();
  }

  getActivity(): Observable<ActivityEntry[]> {
    return this.activity$.asObservable();
  }

  get unreadCount(): number {
    return this.notifications$.getValue().filter(n => !n.read).length;
  }

  notify(type: AppNotification['type'], title: string, message: string): void {
    const n: AppNotification = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type, title, message,
      timestamp: new Date(),
      read: false
    };
    this.notifications$.next([n, ...this.notifications$.getValue()].slice(0, 50));
  }

  markAllRead(): void {
    this.notifications$.next(this.notifications$.getValue().map(n => ({ ...n, read: true })));
  }

  markRead(id: string): void {
    this.notifications$.next(this.notifications$.getValue().map(n => n.id === id ? { ...n, read: true } : n));
  }

  clearAll(): void {
    this.notifications$.next([]);
  }

  logActivity(userId: string, userName: string, action: string, details: string): void {
    const entry: ActivityEntry = {
      id: Date.now().toString(36),
      userId, userName, action, details,
      timestamp: new Date()
    };
    this.activity$.next([entry, ...this.activity$.getValue()].slice(0, 100));
  }
}
