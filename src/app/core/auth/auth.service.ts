import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { Session } from '@core/models/session.model';

export interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  tokenType?: string;
  expiresIn?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly _token = signal<string | null>(this.readStorage('vsiaf_demo_token'));
  private readonly _session = signal<Session | null>(this.restoreSession());

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  token(): string | null {
    return this._token();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
      usuario: credentials.username,
      password: credentials.password,
    }).pipe(
      tap((response) => {
        this._token.set(response.token);
        this.writeStorage('vsiaf_demo_token', response.token);
        this.writeStorage('vsiaf_demo_user', credentials.username);
        this._session.set({
          usuario: credentials.username,
          backups: '—',
          entidad: null,
          unidad: null,
        });
      }),
    );
  }

  logout(): void {
    this._token.set(null);
    this._session.set(null);
    this.removeStorage('vsiaf_demo_token');
    this.removeStorage('vsiaf_demo_user');
  }

  private restoreSession(): Session | null {
    const token = this.readStorage('vsiaf_demo_token');
    const user = this.readStorage('vsiaf_demo_user');
    if (!token || !user) return null;
    return { usuario: user, backups: '—', entidad: null, unidad: null };
  }

  private readStorage(key: string): string | null {
    try {
      return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: string): void {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, value);
    } catch {
      // La sesión seguirá activa en memoria si el navegador bloquea el almacenamiento.
    }
  }

  private removeStorage(key: string): void {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(key);
    } catch {
      // No se requiere acción adicional.
    }
  }
}
