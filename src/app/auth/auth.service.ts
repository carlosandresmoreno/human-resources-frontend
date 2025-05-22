// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment'; // <-- Importa el entorno

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth'; // Asegúrate que esta URL coincida con tu backend
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public isAuthenticated$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadToken();
  }

  private loadToken(): void {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.tokenSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  private saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
    this.tokenSubject.next(token);
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    const errorMessage = error.error?.message || 'Something went wrong';
    return throwError(() => new Error(errorMessage));
  }
}