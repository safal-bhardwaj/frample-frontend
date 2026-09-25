import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Never attach a token to the auth endpoints themselves (login/signup/refresh)
  const isAuthCall = req.url.includes('/auth/');

  const accessToken = authService.getAccessToken();
  const authorizedReq = (!isAuthCall && accessToken)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only try to refresh on 401s from non-auth endpoints — a 401 from
      // /auth/login itself just means "wrong password", not "token expired"
      if (error.status === 401 && !isAuthCall) {
        return authService.refresh().pipe(
          switchMap(() => {
            const newToken = authService.getAccessToken();
            const retriedReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(retriedReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};