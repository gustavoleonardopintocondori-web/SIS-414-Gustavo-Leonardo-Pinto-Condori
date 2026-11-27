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
  tokenType: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly tokenKey = 'vsiaf_demo_token';
  private readonly sessionKey = 'vsiaf_demo_session';

  private readonly _token = signal<string | null>(this.readToken());
  private readonly _session = signal<Session | null>(this.readSession());

  readonly token = this._token.asReadonly();
  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/login`, {
        usuario: credentials.username,
        password: credentials.password,
      })
      .pipe(
        tap((response) => {
          this._token.set(response.token);
          const session: Session = {
            usuario: credentials.username,
            backups: 'Disponible',
            entidad: null,
            unidad: null,
          };
          this._session.set(session);
          sessionStorage.setItem(this.tokenKey, response.token);
          sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
        }),
      );
  }

  logout(): void {
    this._token.set(null);
    this._session.set(null);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.sessionKey);
  }

  private readToken(): string | null {
    try {
      return sessionStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  private readSession(): Session | null {
    try {
      const raw = sessionStorage.getItem(this.sessionKey);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}
