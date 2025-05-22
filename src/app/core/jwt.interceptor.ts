import { HttpInterceptorFn } from '@angular/common/http'; 
import { inject } from '@angular/core'; 
import { AuthService } from '../auth/auth.service'; 
import { environment } from '../../environments/environment';

export const JwtInterceptorFn: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); 
  const token = authService.getToken();

  const isApiUrl = req.url.startsWith(environment.apiUrl); 
  const isAuthUrl = req.url.includes('/api/v1/auth/');
  
  if (token && isApiUrl && !isAuthUrl) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req); 
};