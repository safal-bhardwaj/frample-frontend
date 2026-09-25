import { Routes } from '@angular/router';
import { AuthPage } from './features/auth/auth-page/auth-page';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { Upload } from './features/upload/upload/upload';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  { path: 'login', component: AuthPage, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'upload', component: Upload, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];