import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { map, tap, type Observable } from 'rxjs';

import type { User } from '../models/user.model';
import { TOKEN_STORAGE_KEY, readToken } from './token';

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userState = signal<User | null>(restoreUser());

  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);

  login(email: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>('api/auth/login', { email, password }).pipe(
      tap(response => {
        storage()?.setItem(TOKEN_STORAGE_KEY, response.token);
        this.userState.set(response.user);
      }),
      map(response => response.user),
    );
  }

  logout(): void {
    storage()?.removeItem(TOKEN_STORAGE_KEY);
    this.userState.set(null);
  }

  token(): string | null {
    return storage()?.getItem(TOKEN_STORAGE_KEY) ?? null;
  }
}

function restoreUser(): User | null {
  const token = storage()?.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return null;
  }
  const user = readToken(token);
  if (!user) {
    storage()?.removeItem(TOKEN_STORAGE_KEY);
  }
  return user;
}

function storage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}
