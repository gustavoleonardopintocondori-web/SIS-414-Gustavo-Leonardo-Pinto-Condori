import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';

@Injectable({ providedIn: 'root' })
export class DataApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get<T = Record<string, unknown>>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`);
  }

  list<T = Record<string, unknown>>(resource: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${resource}`);
  }

  create<T = Record<string, unknown>>(resource: string, data: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${resource}`, data);
  }

  createAt<T = Record<string, unknown>>(path: string, data: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, data);
  }

  update<T = Record<string, unknown>>(resource: string, id: string | number, data: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${resource}/${encodeURIComponent(String(id))}`, data);
  }

  remove(resource: string, id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${resource}/${encodeURIComponent(String(id))}`);
  }

  post<T = Record<string, unknown>>(path: string, data: unknown = null): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, data);
  }

  health(): Observable<{ status: string; modo: string }> {
    return this.http.get<{ status: string; modo: string }>(`${this.baseUrl}/health`);
  }
}
