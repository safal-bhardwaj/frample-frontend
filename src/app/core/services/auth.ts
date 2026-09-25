import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, SignupRequest, TokenResponse, AppUser,GoogleLoginRequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private accessTokenSignal = signal<string | null>(null);
  private currentUserSignal = signal<AppUser | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.accessTokenSignal() !== null);

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/login`, request, { withCredentials: true }).pipe(
      tap(response => this.setSession(response))
    );
  }

  signup(request: SignupRequest): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.baseUrl}/signup`, request);
  }

  refresh(): Observable<TokenResponse> {
    // No body needed — the httpOnly cookie travels automatically with withCredentials
    return this.http.post<TokenResponse>(`${this.baseUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap(response => this.setSession(response))
    );
  }

  restoreSession(): Observable<TokenResponse | null> {
    return this.refresh().pipe(
      catchError(() => {
        this.clearLocalState();
        return of(null);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => this.clearLocalState(),
      error: () => this.clearLocalState()
    });
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  private clearLocalState(): void {
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

private setSession(response: TokenResponse): void {
  this.accessTokenSignal.set(response.accessToken);
  this.currentUserSignal.set(response.user);

  }
  googleLogin(request: GoogleLoginRequest): Observable<TokenResponse> {
  return this.http.post<TokenResponse>(`${this.baseUrl}/oauth/google`, request, { withCredentials: true }).pipe(
    tap(response => this.setSession(response))
  );
}
}