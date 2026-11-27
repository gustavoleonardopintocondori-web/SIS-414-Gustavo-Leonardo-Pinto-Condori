import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { Session } from '@core/models/session.model';

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly _session = signal<Session | null>(null);

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);

  login(credentials: LoginRequest): Observable<unknown> {
    // Solo builds "development" y "demo": permite entrar sin backend.
    // En producción DEMO_MODE es false y este bloque se elimina del bundle.
    if (DEMO_MODE && credentials.username === 'admin' && credentials.password === 'admin') {
      this._session.set({
        usuario: 'admin',
        backups: 'None',
        entidad: { codigo: '143', nombre: 'Universidad Autónoma Tomás Frías' },
        unidad: { codigo: 'SIS', nombre: 'CARRERA DE INGENIERIA DE SISTEMAS' },
      });
      return of({});
    }
    return this.http.post(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(() =>
        this._session.set({
          usuario: credentials.username,
          backups: 'None',
          entidad: null,
          unidad: null,
        }),
      ),
    );
  }

  logout(): void {
    this._session.set(null);
  }
}
